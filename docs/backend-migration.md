# Backend migration and cutover

The Next.js process now owns the legacy GraphQL endpoint, REST compatibility routes, PostgreSQL access, Redis cache, and the BullMQ worker. PostgreSQL and Redis remain external durable services in production; `compose.yaml` provides local instances.

## Local setup

1. Copy `.env.example` to `.env.local` and replace development secrets.
2. Start PostgreSQL and Redis with `pnpm infra:up`.
3. Apply the idempotent baseline with `pnpm db:migrate`.
4. Start the web process plus worker with `pnpm dev:worker`.

`pnpm infra:full` builds and runs the complete stack in Docker. The app is exposed at `http://localhost:3101`.

## Production cutover

1. Take PostgreSQL and Redis backups. Keep the existing databases and Redis DB assignments: cache DB 1 and queue DB 2.
2. Run `pnpm db:preflight` against production. Resolve every missing-column error before deployment.
3. Run `pnpm db:migrate`. The baseline uses `IF NOT EXISTS`, so it adopts the existing Ent tables without replacing data.
4. Deploy the merged image with `RUN_WORKER=false`. Send internal smoke traffic to `/probe`, `/api/v2/graphql`, config, upload, and Stripe test-mode endpoints.
5. Move the primary site hostname to the new deployment. Keep `clippingkk-api.annatarhe.com` as a routing alias to the same deployment for old clients.
6. Enable `RUN_WORKER=true` on exactly one initial replica. Scale worker concurrency with `WORKER_CONCURRENCY` only after observing Redis and database load.
7. Remove public traffic from the Go service but leave one old instance alive for 24 hours so its Asynq worker can drain Redis DB 2. The Go binary starts HTTP and Asynq together; keeping the instance unregistered from the load balancer gives worker-only behavior operationally.
8. Compare user, clipping, comment, order, and queue counts with the preflight output. Then stop the Go instance and deprecate the old service.

Do not point BullMQ at an Asynq queue name. Both can share Redis DB 2 during the drain because their keys are namespaced, but only the Go worker can process existing Asynq payloads.

## Required production configuration

Set every core value in `.env.example`. Integrations fail closed when their secret is absent. In particular, use the existing `JWT_SECRET` and `WECHAT_SECRET`; changing either invalidates JWT, `X-CLI`, and WeChat-bind compatibility tokens. Preserve the Stripe webhook secret and route Stripe to `/api/v2/stripe/webhooks` on the merged hostname.
