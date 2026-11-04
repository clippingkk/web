# Database

Production runs [`ghcr.io/rawback-app/db:18-3.6`](https://github.com/rawback-app/db): PostgreSQL 18
with PGroonga 4.1, plus PostGIS 3.6 and `pg_trgm`, which ClippingKK does not use. `compose.yaml` runs
the same image locally. The schema is `src/server/db/schema.ts`, migrated by drizzle
(`pnpm db:migrate`, see [`DEPLOY.md`](../DEPLOY.md)).

## Search

Search runs on [PGroonga](https://pgroonga.github.io/), which indexes Chinese, Japanese and Korean as
well as Latin text. The GraphQL `search` query (the command palette and the iOS app) and the MCP
`search_clippings` tool both go through `src/server/db/search.ts`:

| Helper                   | Matches                                                          | Index                       |
| ------------------------ | ---------------------------------------------------------------- | --------------------------- |
| `clippingMatches(query)` | `array[title, content]`: the Kindle book title and the highlight | `clippings_search_pgroonga` |
| `userMatches(query)`     | `array[name, domain]`                                            | `users_search_pgroonga`     |

The query is [Groonga query syntax](https://groonga.org/docs/reference/grn_expr/query_syntax.html):

- Words separated by whitespace must all match. They may match different columns, so
  `百年孤独 冰块` finds a highlight from that book that mentions 冰块.
- `OR` between words matches either, `-word` excludes one, and `"double quotes"` match a phrase.
- Every word matches as a substring, whatever the script: `nake` finds `snake_case` and `冰` finds
  `冰块`. Matching ignores case and full- or half-width (`ｓｎａｋｅ` finds `snake`).
- Symbols are literal: `%` and `_` are never wildcards. A backslash escapes the next character.
- Malformed syntax such as `(word` or an unclosed quote never raises. A blank query matches nothing.

Substring matching comes from the indexes' tokenizer, `TokenBigramSplitSymbolAlphaDigit`, which splits
every script into bigrams. With PGroonga's default tokenizer, Latin text would match whole words only,
which would break the palette's search-as-you-type and change what `ILIKE '%term%'` used to find.

Two rules keep that behavior in every query plan:

- **Each helper's expression must stay identical to its index's** in `schema.ts` (and migration
  0008). If they differ, Postgres cannot use the index and scans the whole table.
- **Each helper passes `pgroonga_condition(query, index_name => ...)`.** When Postgres checks a row
  outside the index, as in a sequential scan or a filter after the `created_by` btree, PGroonga
  tokenizes it with that index's settings. A bare `&@~ query` would fall back to the default
  tokenizer, and `nake` would stop matching `snake` on those plans.

`src/server/db/__tests__/pgroonga.test.ts` checks both rules and the behavior above against the real
extension.

## Migration 0008

`drizzle/0008_pgroonga_search.sql` runs `CREATE EXTENSION IF NOT EXISTS pgroonga` and creates the two
indexes.

- **The extension.** The image's first start creates `pgroonga` in `POSTGRES_DB`. On a database that
  already has it, the statement is a no-op for any role. Otherwise it needs a superuser: either run
  the migration as one, or run `CREATE EXTENSION pgroonga;` as a superuser first.
- **The indexes.** `pnpm db:migrate` runs in one transaction, so `CREATE INDEX` blocks writes to
  `clippings` while it builds. 20,000 highlights take about a second. On a much larger table, build
  the indexes first without blocking writes. The migration then finds them and skips them:

  ```sql
  CREATE EXTENSION IF NOT EXISTS pgroonga;
  CREATE INDEX CONCURRENTLY IF NOT EXISTS clippings_search_pgroonga ON clippings
    USING pgroonga ((array[title::text, content]))
    WITH (tokenizer = 'TokenBigramSplitSymbolAlphaDigit');
  CREATE INDEX CONCURRENTLY IF NOT EXISTS users_search_pgroonga ON users
    USING pgroonga ((array[name::text, domain::text]))
    WITH (tokenizer = 'TokenBigramSplitSymbolAlphaDigit');
  ```

`pnpm db:preflight` fails if the extension or either index is missing.

## Operating PGroonga

- **Crash safety.** The image leaves `pgroonga.enable_wal` and `pgroonga.enable_crash_safe` off.
  PGroonga indexes are therefore not WAL-logged: after a crash or an unclean shutdown, a PGroonga
  index can be left broken, and physical replicas do not carry its contents. If search errors or
  misses highlights after an unclean stop, rebuild the index with
  `REINDEX INDEX CONCURRENTLY clippings_search_pgroonga;` (and `users_search_pgroonga`). A
  `pg_dump` backup is unaffected, because a restore rebuilds every index.
- **Image upgrades.** After pulling a new release of the image, run
  `docker exec -u postgres <container> update-extensions.sh` (see the rawback-app/db README).

## Tests

PGlite cannot load PGroonga. `src/server/db/__tests__/pglite.ts` applies the migrations without the
PGroonga statements and defines a stand-in for `&@~` and `pgroonga_condition`: every whitespace-separated
word is a case-insensitive substring. Tests that need a database call `migratePglite(pg)`.

`src/server/db/__tests__/pgroonga.test.ts` runs only when `TEST_DATABASE_URL` points at a server
running the image, with a role that may create databases and extensions. It migrates a throwaway
database exactly as `pnpm db:migrate` does. Locally:

```bash
docker run -d --name ck-test-db -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:5433:5432 ghcr.io/rawback-app/db:18-3.6
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/postgres pnpm test:server
```

## Local data from PostgreSQL 16

`compose.yaml` used to run `postgres:16-alpine` on the `clippingkk-postgres` volume. PostgreSQL 18
cannot open that data directory, so compose now uses a new volume, `clippingkk-postgres-18`, and leaves
the old one alone. To keep local data, dump it while the old container is still running, then restore
it into the new one:

```bash
docker compose exec -T postgres pg_dump -U postgres clippingkk > clippingkk.sql
docker compose down
pnpm infra:up
psql postgresql://postgres:admin@127.0.0.1:5432/clippingkk -f clippingkk.sql
pnpm db:migrate
```

Otherwise, `pnpm infra:up && pnpm db:migrate` starts from an empty database. Once you no longer need
the old data, `docker volume rm web_clippingkk-postgres` frees its space.
