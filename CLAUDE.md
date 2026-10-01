# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **ClippingKK web application** - a Next.js 15 application for managing and sharing Kindle book highlights/clippings with social features, AI enhancements, and various export options.

**Package Manager**: This project uses **pnpm** exclusively. Do not use npm or yarn. All commands should be run with `pnpm`.

## Development Commands

**Essential commands:**

- `pnpm dev` - Start development server on port 3101
- `pnpm build` - Build for production (runs GraphQL codegen first)
- `pnpm test` - Run Vitest tests in happy-dom
- `pnpm test -- [path/to/test]` - Run a specific test file
- `pnpm test -- --watch` - Run tests in watch mode
- `pnpm lint` - Run oxlint linter
- `pnpm lint:fix` - Auto-fix linting issues with oxlint
- `pnpm format` - Format code with oxfmt
- `pnpm format:check` - Check formatting without writing
- `pnpm codegen` - Generate GraphQL types from schema

**Additional commands:**

- `pnpm test:update` - Update Vitest snapshots
- `pnpm start` - Start production server

## Architecture Overview

### Next.js App Router Structure

- Uses Next.js 15 with App Router and React 19
- Dynamic routing: `/dash/[userid]/` for user-specific pages
- Server-side metadata generation and prefetching
- Nested layouts with dedicated loading/error states

### Data Layer

- **GraphQL**: Apollo Client with separate server/client instances
- **REST API**: "Wenqu" service for book metadata via `wenquRequest()`
- **State Management**: XState for the Kindle import flow (`src/hooks/my-file.machine.ts`), React Query for Wenqu book metadata
- **Caching**: Wenqu queries are fresh for 3 days; other React Query queries go stale after a few seconds

### Authentication Flow

Sign-in goes through **Gate** (OIDC): `/auth` → `/api/auth/login` → Gate → `/api/auth/callback`,
which stores the session in Redis and sets the HttpOnly `ck-session` cookie.

- Server components: `getViewer()` / `requireViewer()` / `requireViewerRoute()` (`src/server/data/`)
- Build sign-in links with `authHref(next)` so readers come back to where they were
- Premium status and admin rights come from Gate (`premiumEndAt`, `isAdmin` on the viewer)

## Key Patterns

### GraphQL Integration

```typescript
// Server components (src/server/data/*): UNAUTHORIZED redirects to sign-in with
// `next`, NOT_FOUND/FORBIDDEN render not-found. doApolloServerQuery is deprecated.
const data = await serverQuery(ProfileDocument, { id })
const viewer = await getViewer() // or requireViewer() / requireViewerRoute()
const user = await resolvePathUser(params.userid)

// Client components pass the generated document to Apollo's hooks
import { useQuery } from '@apollo/client/react'
const { data, loading } = useQuery(ProfileDocument, { variables: { id } })
```

Links: build sign-in links with `authHref(next)` (`src/lib/auth-href.ts`) and user
URLs with `dashHref` / `clippingHref` / `bookHref` (`src/utils/profile.utils.ts`),
never by hand.

The GraphQL API lives in this same project (`src/app/api/v2/graphql/route.ts`, backed by
`src/server/graphql/`). Server components therefore execute **in-process** against the yoga
instance via `src/server/graphql/local-transport.ts` — no socket, no DNS, no TLS. Only the
browser client talks HTTP. Never point the server Apollo client at an absolute origin; that
reintroduces a public round-trip to reach code already loaded in the same process.

### Server-Client Data Flow

Server components prefetch with React Query, client hydrates:

```typescript
// Server prefetch
await rq.prefetchQuery({ queryKey: ['key'], queryFn: fetcher })
const dehydratedState = dehydrate(rq)

// Client hydration
<HydrationBoundary state={dehydratedState}>
```

### Component Organization

- **Naming**: kebab-case directories, PascalCase components
- **Structure**: Feature-based organization (`book-cover/`, `clipping-item/`)
- **Types**: Generated GraphQL types, strict TypeScript throughout

## Important File Locations

**Configuration:**

- `codegen.yml` - GraphQL code generation
- `next.config.ts` - Next.js config with image domains
- `src/styles/tailwind.css` - Tailwind v4 entry (CSS-first, no `tailwind.config.js`)
- `src/styles/theme.css` - the app's design tokens, type roles and utilities
- `.oxlintrc.json` - oxlint linting rules
- `.oxfmtrc.json` - oxfmt formatting rules

**Core Services:**

- `src/services/apollo.server.ts` - Server-side Apollo Client setup
- `src/services/apollo.shard.ts` - Shared Apollo configuration
- `src/services/wenqu.ts` - External book service API
- `src/server/graphql/yoga.ts` - The graphql-yoga instance shared by the route handler and RSC
- `src/server/graphql/local-transport.ts` - In-process GraphQL transport for server components

**Generated Code:**

- `src/gql/graphql.ts` - GraphQL types and typed `XxxDocument`s (auto-generated, gitignored)
- `src/schema/generated.tsx` - GraphQL schema types (auto-generated)
- `src/schema/` - GraphQL schema definitions

## Testing

- **Framework**: Vitest
- **Main test**: `/test/main.test.ts`
- **Coverage**: Uses v8 provider with text/lcov output
- **Setup**: `/test/setup.ts` for global test configuration
- **Environment**: happy-dom for React component testing

## GraphQL Schema Updates

When schema changes occur:

1. Download new schema from GraphQL endpoint
2. Place in `src/schema/` directory
3. Run `pnpm codegen` to regenerate TypeScript types

## Environment Variables

- `CACHE_REDIS_URI` - Redis connection for caching
- `RSC_LOGGED_INFO_SECRET` - Server component logging
- `OPENAI_API_KEY` and `OPENAI_MODEL` - server-only AI configuration

## State Management Guidelines

- Use XState for complex UI flows with multiple states/transitions
- Use React Query for server state management and caching
- Combine both for auth flows and data-heavy operations

## Internationalization (i18n)

The application supports multiple languages using **i18next** with Next.js integration.

### Supported Languages

- **English (en)** - Default/fallback language
- **Chinese (zh/zhCN)** - Simplified Chinese
- **Japanese (ja)**
- **Korean (ko)**

### i18n Architecture

- **Server Components**: `const { t } = await getTranslation(undefined, 'ns')` from `src/i18n/index.ts`
- **Client Components**: `useTranslation(undefined, 'ns')` from `src/i18n/client.ts`
- **Hydration**: `src/i18n/root.tsx` seeds a per-request i18next instance with the reader's
  language, so client components render the right language on the server too
- **New namespace files** must be added to `NAMESPACES` in `src/i18n/namespaces.ts` (a test checks
  the list and that every language has the same keys)
- Never write `t('key') ?? 'fallback'` — `t` never returns nullish
- **Translation Files**: Located in `src/locales/{language}.json` and `src/locales/{language}/{namespace}.json`
- **Language Detection**: Stored in cookies using `STORAGE_LANG_KEY`
- **Resource Loading**: Dynamic imports via `i18next-resources-to-backend`

### Usage Pattern

```typescript
// Server component
import { getTranslation } from '@/i18n'

async function ServerComponent() {
  const { t } = await getTranslation(undefined, 'namespace')
  return <div>{t('key')}</div>
}

// Client component
import { useTranslation } from '@/i18n/client'

function ClientComponent() {
  const { t } = useTranslation(undefined, 'namespace')
  return <div>{t('key')}</div>
}
```

### Language Mapping

- Chinese variants (`zh`, `zh-CN`, etc.) are normalized to `zhCN` for file loading
- Cookie value determines default language, falls back to `en`

## Billing and Premium

Gate owns Stripe (checkout, portal, webhook); the iOS app sells App Store subscriptions that
ClippingKK verifies (`src/server/billing/apple/`) and writes to Gate as one `apple_iap` grant per
reader. Premium is decided only by `isPremium(userId)` (`src/server/billing/premium.ts`), which reads
Gate's `premiumEndAt`; badges use the lenient `userPremiumEndAt` loader. Never read
`users.premium_end_at` or the `orders` table (legacy). See `docs/billing.md`.

## MCP Server

`/api/v3/mcp` is a read-only MCP server (protocol 2026-07-28, `@modelcontextprotocol/server` v2)
over the caller's own library. Tools live in `src/server/mcp/tools/`, their SQL in
`src/server/mcp/queries.ts`, and every query must stay scoped to `createdBy = userId`. Callers use
`ck_mcp_` personal access tokens (Settings → AI & MCP) or Gate OAuth tokens audienced at
`GATE_RESOURCE`. See `docs/mcp.md`.

## Rich Text Editor

The application uses **Tiptap** (a headless editor built on ProseMirror) for rich text editing, replacing the legacy Lexical editor.

### Editor Features

- **Markdown Support**: Bidirectional markdown conversion (read/write)
- **Syntax Highlighting**: Code blocks with Lowlight (supports common languages)
- **Tables**: Resizable table support
- **Typography**: Smart typography transformations
- **Links**: Clickable links with custom styling
- **StarterKit**: Basic formatting (bold, italic, headings, lists, etc.)

### Component Location

- Main component: `src/components/RichTextEditor/index.tsx`
- Tiptap implementation: `src/components/RichTextEditor/TiptapEditor.tsx`
- Markdown components: `src/components/RichTextEditor/markdown-components.tsx`

### Usage Pattern

```typescript
import CKBaseEditor from '@/components/RichTextEditor'

<CKBaseEditor
  editable={true}
  markdown={initialMarkdown}
  onContentChange={(markdown) => handleUpdate(markdown)}
  className="custom-editor-styles"
/>
```

### Key Configuration

- **Content Type**: Uses markdown as primary format
- **Code Highlighting**: Lowlight with common language support
- **Link Behavior**: Opens on click disabled by default
- **Placeholder**: "Enter some text..." when empty
- **Indentation**: 2 spaces for markdown formatting

### Migration Note

This editor replaced Lexical. The component maintains a legacy interface (`LegacyEditorRef`) for backward compatibility with existing code that used the Lexical API.

## UI Style Guidelines

The UI is built on **`@annatarhe/lake-ui`** (the maintainer's component library) with an
"editorial reading room" look: paper-like, typography-first, calm; the highlights are the hero.

### Components

- Use lake-ui for primitives: `button` (polymorphic via `render={<Link href=… />}`; `buttonStyles()`
  for plain `<a>`), `icon-button`, `menu`, `popover`, `modal`, `sheet`, `confirm-dialog`, `tabs`,
  `nav-tabs`, `segmented-control`, `avatar`, `badge`, `skeleton`, `spinner`, `empty-state`,
  `progress`, `table`, `tooltip`, `kbd`, form fields, `contribution-wall`. Import per component:
  `import Button from '@annatarhe/lake-ui/button'`.
- App-level building blocks: `components/layout/{page,page-header,section,callout}`,
  `components/shell/*` (app and marketing shells), `components/clipping/clipping-card` (one card,
  variants `grid|list|compact|feature`), `components/book/*`, `components/user/user-chip`,
  `components/list/{masonry-grid,load-more-footer}`.
- Every route renders inside `<Page width="reading|default|wide">`.
- `cn()` from `@/lib/utils` (it re-exports lake-ui's, which understands the lake token classes).

### Tokens (never raw palette classes)

- Colors come from lake-ui's semantic tokens, themed in `src/styles/theme.css`:
  `bg-lake-canvas|surface|surface-raised|surface-muted`, `text-lake-fg|fg-muted|fg-subtle`,
  `border-lake-line|line-strong`, `bg-lake-accent` + `text-lake-accent-fg`, `text-lake-accent-text`
  for links, `bg-lake-accent-soft`, `text-lake-danger|success|warning`, `bg-marker` (highlighter).
- The solid accent is blue-600 (hover blue-700) in both themes, with white text on it
  (`text-lake-accent-fg`). Links use `text-lake-accent-text` (blue-600 light, blue-400 dark).
- Tokens switch with the theme, so no `dark:` variants are needed.
- Radius: `rounded-lake-control` (controls) and `rounded-lake-panel` (cards, dialogs).
  Shadows: `shadow-lake-card`, `shadow-lake-overlay`.

### Typography

- Type roles (`src/styles/theme.css`): `type-display`, `type-title`, `type-heading`, `type-body`,
  `type-quote`, `type-quote-lg`, `type-meta`, `type-eyebrow`. Don't combine a role with `text-*`
  size classes.
- `font-reading` (Literata + LXGW WenKai) for quotes, titles and book names; `font-sans` for UI.

### Motion and interaction

- 150–250ms color/opacity transitions; no gradients, glassmorphism, glow or hover lift.
- Respect `motion-reduce`; focus rings via `focus-visible:ring-2 focus-visible:ring-lake-ring`.

### Theme

- The `ck-theme` cookie holds `system|light|dark`; an inline script in `<head>` applies it before
  paint (`src/lib/theme.ts`). `useTheme()` in `components/theme/use-theme.ts` reads/sets it.
