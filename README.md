# ClippingKK Web

ClippingKK is a full-stack Next.js application for importing, organizing, and
sharing Kindle highlights. The Next.js process serves the web UI, GraphQL and
REST APIs, PostgreSQL-backed data access, Redis caching, and an optional BullMQ
worker.

## Requirements

- Node.js 26
- pnpm 10.25 (the version pinned in `package.json`)
- Docker with Compose for local PostgreSQL and Redis
- A PromptPal API token when regenerating `src/types.g.ts`

## Local development

Install dependencies and create a local configuration:

```bash
pnpm install
cp .env.example .env.local
pnpm infra:up
pnpm db:migrate
pnpm codegen
pnpm dev:worker
```

Edit `.env.local` before starting the app. The checked-in defaults connect to
the PostgreSQL and Redis containers from `compose.yaml`. `pnpm dev` runs only
the web process; `pnpm dev:worker` also processes background jobs.

Generated GraphQL output under `src/gql/` is intentionally ignored. If
`src/types.g.ts` is absent, set `PROMPTPAL_API_TOKEN` and run `pp g` using
`promptpal.yml` before building or starting the app.

## Common commands

| Command             | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev`          | Start the development server at `http://localhost:3101`.    |
| `pnpm build`        | Regenerate GraphQL artifacts and create a production build. |
| `pnpm test`         | Run the Vitest suite in happy-dom.                          |
| `pnpm typecheck`    | Type-check the application without emitting files.          |
| `pnpm lint`         | Check `src/` with oxlint.                                   |
| `pnpm format:check` | Verify formatting with oxfmt.                               |
| `pnpm infra:full`   | Build and run the complete local stack in Docker.           |
| `pnpm infra:down`   | Stop the local infrastructure containers.                   |

Application routes live in `src/app`, reusable UI in `src/components`, and
server integrations in `src/server` and `src/services`. GraphQL operations and
generated types are under `src/schema` and `src/gql`; tests live in `test/` and
beside focused source modules.

## Deployment

Production supports Docker-based self-hosting. Use a versioned container image
with external PostgreSQL and Redis services; the repository's `compose.yaml`
contains development credentials and is not a production deployment file.

See [DEPLOY.md](./DEPLOY.md) for configuration, migrations, rollout, health
checks, upgrades, and source builds.
