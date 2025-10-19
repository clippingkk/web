# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **ClippingKK web application** - a Next.js 15 application for managing and sharing Kindle book highlights/clippings with social features, AI enhancements, and various export options.

**Package Manager**: This project uses **pnpm** exclusively. Do not use npm or yarn. All commands should be run with `pnpm`.

## Development Commands

**Essential commands:**
- `pnpm dev` - Start development server on port 3101
- `pnpm build` - Build for production (runs GraphQL codegen first)
- `pnpm test` - Run Jest tests
- `pnpm test -- [path/to/test]` - Run a specific test file
- `pnpm test -- --watch` - Run tests in watch mode
- `pnpm lint` - Run ESLint linter
- `pnpm lint:fix` - Auto-fix linting issues with ESLint
- `pnpm format` - Format code with Prettier
- `pnpm codegen` - Generate GraphQL types from schema

**Additional commands:**
- `pnpm test:update` - Update Jest snapshots
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
- **State Management**: XState for complex flows (auth), React Query for server state
- **Caching**: 3-day stale time for React Query, persistent cache with custom persister

### Authentication Flow
Multi-provider auth using XState machine:
- Email/password with OTP
- Apple Sign-In, GitHub OAuth, MetaMask wallet
- JWT tokens in secure cookies with automatic refresh
- Cloudflare Turnstile for bot protection

## Key Patterns

### GraphQL Integration
```typescript
// Server components
const response = await doApolloServerQuery<ProfileQuery>({
  query: ProfileDocument,
  context: { headers: { Authorization: 'Bearer ' + token } }
})

// Client components use generated hooks
const { data, loading } = useProfileQuery({ variables: { id } })
```

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
- `tailwind.config.js` - UI styling configuration
- `.eslintrc.json` - ESLint linting rules

**Core Services:**
- `src/services/apollo.server.ts` - Server-side Apollo Client setup
- `src/services/apollo.shard.ts` - Shared Apollo configuration
- `src/services/wenqu.ts` - External book service API
- `src/services/urls.ts` - URL constants and routing

**Generated Code:**
- `src/gql/generated.tsx` - GraphQL types and hooks (auto-generated)
- `src/schema/generated.tsx` - GraphQL schema types (auto-generated)
- `src/schema/` - GraphQL schema definitions

## Testing

- **Framework**: Jest with TypeScript support via ts-jest preset
- **Main test**: `/test/main.test.ts`
- **Coverage**: Uses v8 provider with text/lcov output
- **Setup**: `/test/setup.ts` for global test configuration
- **Environment**: jest-environment-jsdom for React component testing

## GraphQL Schema Updates
When schema changes occur:
1. Download new schema from GraphQL endpoint
2. Place in `src/schema/` directory  
3. Run `pnpm codegen` to regenerate TypeScript types

## Environment Variables
- `CACHE_REDIS_URI` - Redis connection for caching
- `RSC_LOGGED_INFO_SECRET` - Server component logging
- `NEXT_PUBLIC_PP_TOKEN` - PromptPal integration token

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
- **Server Components**: Use `useTranslation()` from `src/i18n/index.ts`
- **Client Components**: Use `useTranslation()` from `react-i18next`
- **Translation Files**: Located in `src/locales/{language}.json` and `src/locales/{language}/{namespace}.json`
- **Language Detection**: Stored in cookies using `STORAGE_LANG_KEY`
- **Resource Loading**: Dynamic imports via `i18next-resources-to-backend`

### Usage Pattern
```typescript
// Server component
import { useTranslation } from '@/i18n'

async function ServerComponent() {
  const { t } = await useTranslation('en', 'namespace')
  return <div>{t('key')}</div>
}

// Client component
import { useTranslation } from 'react-i18next'

function ClientComponent() {
  const { t } = useTranslation('namespace')
  return <div>{t('key')}</div>
}
```

### Language Mapping
- Chinese variants (`zh`, `zh-CN`, etc.) are normalized to `zhCN` for file loading
- Cookie value determines default language, falls back to `en`

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

### Design Principles
- **Simple & Elegant**: Minimize visual noise, focus on content and readability
- **Subtle Gradients**: Use closely related colors for smooth, sophisticated gradients
- **Consistent Spacing**: Use Tailwind's spacing scale consistently throughout

### Color System
- **Primary Color**: `blue-400` (applies to both light and dark themes)
  - Light theme: `bg-blue-400`, `text-blue-400`, `border-blue-400`
  - Dark theme: `dark:bg-blue-400`, `dark:text-blue-400`, `dark:border-blue-400`
- **Gradient Colors**: Use adjacent color values for subtle gradients
  - Example: `from-blue-300 via-blue-400 to-blue-500`
  - Alternative: `from-blue-400 to-indigo-400` for slight hue shifts
- **Neutral Palette**: 
  - Light mode: `zinc-800` to `zinc-50`
  - Dark mode: `gray-50` to `gray-900`

### Theme Support
- **Implementation**: Use Tailwind's dark mode classes with `class` strategy

### Component Styling Patterns
```tsx
// Example button with theme support
<button className="
  bg-blue-400 hover:bg-blue-500 
  dark:bg-blue-400 dark:hover:bg-blue-500
  text-white transition-colors duration-200
  px-4 py-2 rounded-lg shadow-sm
">

// Example gradient background
<div className="
  bg-gradient-to-br from-blue-300 to-blue-500
  dark:from-blue-400 dark:to-blue-600
">

// Example card with subtle shadow
<div className="
  bg-white dark:bg-zinc-800
  border border-gray-200 dark:border-zinc-700
  shadow-sm hover:shadow-md transition-shadow
  rounded-xl p-6
">
```

### Typography
- **Font Stack**: System fonts for optimal performance
- **Text Colors**: 
  - Primary: `text-gray-900 dark:text-zinc-50`
  - Secondary: `text-gray-600 dark:text-zinc-400`
  - Muted: `text-gray-400 dark:text-zinc-500`
- **Font Sizes**: Use Tailwind's default scale (`text-sm`, `text-base`, `text-lg`, etc.)

### Interactive Elements
- **Hover States**: Subtle color shifts, no dramatic changes
- **Focus States**: Clear focus rings using `focus:ring-2 focus:ring-blue-400`
- **Transitions**: Always include smooth transitions (`transition-all duration-200`)
- **Disabled States**: Use `opacity-50 cursor-not-allowed`

### Layout Guidelines
- **Container**: Max width with responsive padding
- **Spacing**: Consistent use of Tailwind spacing units
- **Border Radius**: Prefer `rounded-lg` or `rounded-xl` for modern feel
- **Shadows**: Use sparingly - `shadow-sm` for cards, `shadow-md` on hover