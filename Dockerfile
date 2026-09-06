FROM node:26-alpine AS base

# Install dependencies only when needed
FROM base AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME/bin:$PNPM_HOME:$PATH
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat g++ make py3-pip ca-certificates openssl
WORKDIR /app

# Install the native pnpm version pinned by the project.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN wget -qO /tmp/install-pnpm.sh https://get.pnpm.io/install.sh \
    && PNPM_VERSION="$(node -p 'require("./package.json").packageManager.slice(5)')" \
       ENV=/root/.shrc SHELL=/bin/sh sh /tmp/install-pnpm.sh \
    && rm /tmp/install-pnpm.sh \
    && pnpm --version
RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV STANDALONE=1
ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV RUN_WORKER=false
ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT
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

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "--env-file-if-exists=/app/.env", "server.js"]
