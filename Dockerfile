FROM node:23.6-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat g++ make py3-pip
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./src/types.g.ts ./
RUN npm install -g corepack@latest
RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV production
ENV STANDALONE 1
ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT
ARG NEXT_PUBLIC_PP_TOKEN
ENV NEXT_PUBLIC_PP_TOKEN=$NEXT_PUBLIC_PP_TOKEN

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install -g corepack@latest
RUN corepack enable pnpm && pnpm run codegen && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT
ARG NEXT_PUBLIC_PP_TOKEN
ENV NEXT_PUBLIC_PP_TOKEN=$NEXT_PUBLIC_PP_TOKEN
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next && chown nextjs:nodejs /app

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ------- Instrumentation patch -------
COPY --from=builder /app/instrumentation.js ./instrumentation.js
# Patch server.js so it starts instrumentation
RUN sed -i '1i\const { register } = require("./instrumentation.js");\nregister();\n' server.js
# ------- End of instrumentation patch -------


USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
