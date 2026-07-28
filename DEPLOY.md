# Docker Self-Hosting

Docker is the supported production deployment method for ClippingKK. The
recommended topology is a version-pinned application container connected to
durable PostgreSQL and Redis services, with TLS terminated by a reverse proxy.
The application listens on port `3000` inside the container.

The repository's `compose.yaml` is for local development only. It uses
development credentials and publishes database ports, so do not use it as a
production configuration.

## Prerequisites

- A Docker host with access to PostgreSQL 16 or a compatible managed service
- Redis 7.2 or a compatible managed service, with persistence enabled
- A hostname and TLS-capable reverse proxy
- A checkout matching the deployed release for migrations and preflight checks
- Node.js 26 and pnpm 10.25 on the migration host

## Configure the environment

Create a root-owned file such as `/opt/clippingkk/web.env`:

```dotenv
NODE_ENV=production
DATABASE_URL=postgresql://clippingkk:replace-me@postgres.example:5432/clippingkk
DATABASE_POOL_MAX=10
REDIS_URL=redis://:replace-me@redis.example:6379/1
QUEUE_REDIS_URL=redis://:replace-me@redis.example:6379/2
JWT_SECRET=replace-with-a-long-random-secret
APP_ORIGIN=https://clippingkk.example.com
CORS_ALLOWED_ORIGINS=https://clippingkk.example.com
ROOT_USERS=1
RUN_WORKER=false
WORKER_CONCURRENCY=1
DEBUG=false
```

Restrict access with `chmod 600 /opt/clippingkk/web.env`. Keep the same
`JWT_SECRET` when upgrading an existing installation; changing it invalidates
issued tokens. Use distinct Redis databases for cache and queue data. Configure
optional authentication, payment, email, object-storage, and observability
integrations from `.env.example` only when those features are enabled.

The application validates its server environment before accepting requests. A
missing or invalid `DATABASE_URL`, `REDIS_URL`, or `JWT_SECRET` causes the
container to exit during startup. This validation does not connect to
PostgreSQL or Redis; use `/probe` to verify service connectivity.

`NEXT_PUBLIC_*` values are embedded into browser assets during the image build.
They are not runtime secrets and changing them requires a new image. The
published image already contains its release-time values.

## Prepare the database

Back up PostgreSQL and Redis before every upgrade. From a source checkout that
matches the container version, install dependencies and inject the production
connection variables through your shell or secret manager:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm db:preflight
```

Migrations are not run automatically by the application container. For a
legacy Go-backend cutover, follow the ordering and queue-drain instructions in
[`docs/backend-migration.md`](./docs/backend-migration.md) instead.

## Run a released image

Choose an explicit release rather than `latest`. Replace the example version
before running these commands:

```bash
CK_VERSION=5.15.0
CK_IMAGE=registry.cn-shanghai.aliyuncs.com/annatarhe/clippingkk-web:$CK_VERSION

docker pull "$CK_IMAGE"
docker run -d \
  --name clippingkk-web \
  --restart unless-stopped \
  --env-file /opt/clippingkk/web.env \
  -p 127.0.0.1:3101:3000 \
  "$CK_IMAGE"
```

Proxy the public HTTPS hostname to `127.0.0.1:3101` and preserve the original
host and forwarding headers. Do not expose PostgreSQL or Redis publicly.

Start the first rollout with `RUN_WORKER=false`. After the web/API smoke checks
pass, set `RUN_WORKER=true` on exactly one initial application replica and
recreate that container. Increase `WORKER_CONCURRENCY` or the number of worker
enabled replicas only after observing database and Redis load.

## Verify the deployment

The readiness endpoint returns `204` only when both PostgreSQL and Redis are
reachable:

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3101/probe
docker logs --tail 200 clippingkk-web
```

Also smoke-test sign-in, `/api/v2/graphql`, uploads, and any enabled payment or
export integrations. A `503` from `/probe` means at least one required data
service is unavailable.

## Build from source

Fresh checkouts need the ignored PromptPal type output before Docker can copy
the source tree. Generate it using `promptpal.yml`, then build the standalone
Next.js image:

```bash
PROMPTPAL_API_TOKEN=replace-me pp g

docker build \
  --build-arg GIT_COMMIT="$(git rev-parse HEAD)" \
  --build-arg NEXT_PUBLIC_PP_TOKEN="$NEXT_PUBLIC_PP_TOKEN" \
  -t clippingkk-web:"$(git describe --tags --always)" \
  .
```

Pass only public build values as build arguments. Supply database credentials,
JWT keys, and integration secrets at runtime through `--env-file` or a secret
manager. Docker excludes `.env` files from the build context so server secrets
are neither loaded by `next build` nor copied into the standalone image.

## Upgrade and rollback

For an upgrade, retain the previous image tag, back up durable services, apply
the new release's migrations, and recreate the container with the same runtime
environment. Deploy with the worker disabled, verify `/probe` and application
flows, and then re-enable worker processing.

To roll back, recreate the container from the previous pinned image. Database
migrations may not be backward-compatible; restore the pre-upgrade backup when
the older application cannot use the migrated schema.
