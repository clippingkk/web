FROM node:alpine AS deps
# RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories
RUN apk --no-cache --virtual build-dependencies add libc6-compat g++ make python3
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY types package.json package-lock.json pnpm-lock.yaml codegen.yml next-env.d.ts next.config.js next-i18next.config.js postcss.config.js tailwind.config.js tsconfig.json ./
RUN pnpm install --frozen-lockfile --force
COPY ./src ./src
RUN npm run codegen

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

FROM node:alpine AS runner
WORKDIR /app

ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=deps /app/next.config.js ./
COPY --from=deps /app/package.json ./package.json
COPY ./public ./public
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./
# next need sharp to process images
# RUN npm install --no-package-lock --no-save --force sharp

USER nextjs

EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
