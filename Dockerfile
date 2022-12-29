# Install dependencies only when needed
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories
RUN apk --no-cache --virtual build-dependencies add libc6-compat g++ make python3
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY types package.json package-lock.json pnpm-lock.yaml codegen.yml next-env.d.ts next.config.js next-i18next.config.js postcss.config.js tailwind.config.js tsconfig.json ./
RUN pnpm install --frozen-lockfile --force
COPY ./src ./src
RUN npm install -g apollo graphql && npm run gql && npm run codegen

# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /app
ENV NODE_ENV production
ENV IS_FLY_IO 1

COPY --from=deps /app/ ./
RUN apk add --no-cache curl \
  && curl -sf https://gobinaries.com/tj/node-prune | sh -s -- -b /usr/local/bin \
  && apk del curl \
  && corepack enable \
  && corepack prepare pnpm@latest --activate \
  && npm run build \
  && pnpm install --prod --frozen-lockfile \
  && cd .next/standalone \
  && node-prune
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=deps /app/__generated__ ./__generated__
# COPY --from=deps /app/src ./src
# COPY --from=deps package.json package-lock.json pnpm-lock.yaml codegen.yml next-env.d.ts next.config.js postcss.config.js tailwind.config.js tsconfig.json ./

# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=deps /app/next.config.js ./
# COPY --from=builder /app/public ./public
COPY --from=deps /app/package.json ./package.json
COPY ./public ./public
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
