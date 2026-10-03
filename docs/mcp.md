# MCP server

ClippingKK exposes a [Model Context Protocol](https://modelcontextprotocol.io) server so AI
assistants (Claude, Claude Code, Cursor, …) can read a reader's own library.

- **Endpoint:** `POST /api/v3/mcp`, which uses the Streamable HTTP transport. It follows protocol
  revision `2026-07-28`, which is stateless: no `initialize` handshake and no sessions. 2025-era
  clients are still served, statelessly. GET and DELETE answer `405`.
- **Library:** [`@modelcontextprotocol/server`](https://www.npmjs.com/package/@modelcontextprotocol/server)
  v2. The endpoint uses `createMcpHandler` and builds a fresh `McpServer` for each request
  (`src/server/mcp/server.ts`).
- **Scope:** read-only, and only the caller's own clippings, private ones included. It never reaches
  another reader's data, public or not.

## Tools

| Tool | What it returns |
|---|---|
| `get_profile` | Name, bio, Premium, highlight and book counts, and the first and last highlight dates |
| `get_yearly_report` | One UTC year: total highlights, books ranked by highlights, a count per month, and the busiest day |
| `get_reading_stats` | Highlight counts per day, month or year, plus the years that have any highlights |
| `list_books` | Books with Wenqu titles and authors, highlight counts and reading dates. It can also list highlights that never matched a book, grouped by their Kindle title |
| `get_book` | Wenqu metadata for one book, plus the reader's count and dates for it |
| `search_clippings` | Highlights filtered by text, book (`doubanId` or Kindle title), source, visibility and date range. Paged by cursor |
| `get_clipping` | One highlight by id |

The queries live in `src/server/mcp/queries.ts` and build on the helpers the GraphQL resolvers use
(`src/server/clippings/queries.ts`). Wenqu metadata is cached in Redis for three days
(`src/server/mcp/books.ts`). If a tool fails for an unexpected reason, the client sees only a
generic message; the details are logged.

## Authentication

Every request needs `Authorization: Bearer <token>`. Two kinds of token are accepted
(`src/server/mcp/auth.ts`):

1. **Personal access tokens (`ck_mcp_…`)**
   - Created under Settings → AI & MCP, at `/dash/<you>/settings/mcp`.
   - Stored as a sha256 digest in `mcp_tokens`. A reader can have at most 10 active tokens.
   - They can be set to expire and can be revoked.
   - They are managed with `GET`/`POST /api/v3/tokens` and `DELETE /api/v3/tokens/:id`. Those
     routes accept only the cookie session, so an MCP token cannot create more tokens.
2. **Gate OAuth access tokens**
   - ES256 JWTs from Gate whose `aud` includes `GATE_RESOURCE`.
   - `sub` is mapped to `users.gate_user_id`. If no ClippingKK account is linked to that `sub`,
     the request gets `403` rather than a new challenge, so the client doesn't loop through
     sign-in.

Both paths refuse a deleted account. Requests are limited to 120 per minute
per reader. A browser `Origin` must be `APP_ORIGIN` or one of `CORS_ALLOWED_ORIGINS`.

### OAuth discovery

- An unauthenticated request gets
  `401 WWW-Authenticate: Bearer resource_metadata="<APP_ORIGIN>/.well-known/oauth-protected-resource"`.
- That RFC 9728 document is also served at
  `/.well-known/oauth-protected-resource/api/v3/mcp`. Its `resource` is `GATE_RESOURCE`, and its
  authorization server is Gate's issuer.
- MCP clients register with Gate through Client ID Metadata Documents; Gate has no dynamic client
  registration.
- In Gate, the ClippingKK project's **MCP server URL** (Project settings, or `mcpResource` on
  `PATCH /projects/{id}`) must equal `GATE_RESOURCE`, for example
  `https://clippingkk.annatarhe.com`. MCP clients then sign in under the ClippingKK project, and
  Gate issues tokens audienced at it. See `docs/mcp.md` in the Gate repository.

`GATE_RESOURCE` must equal the origin clients connect to. OAuth therefore works only on the
deployed origin. For local development, either use a personal access token, or set
`GATE_RESOURCE=http://localhost:3101` and use the same URL as the project's MCP server URL in a
local Gate.

## Connecting a client

```bash
# OAuth (the client opens a browser to sign in through Gate)
claude mcp add --transport http clippingkk https://clippingkk.annatarhe.com/api/v3/mcp

# Personal access token
claude mcp add --transport http clippingkk https://clippingkk.annatarhe.com/api/v3/mcp \
  --header "Authorization: Bearer ck_mcp_…"
```

To debug interactively, run `npx @modelcontextprotocol/inspector` against the endpoint.
