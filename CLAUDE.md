# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **ClippingKK web application** - a Next.js 15 application for managing and sharing Kindle book highlights/clippings with social features, AI enhancements, and various export options.

## Development Commands

**Essential commands:**
- `pnpm dev` - Start development server on port 3101
- `pnpm build` - Build for production (runs GraphQL codegen first)
- `pnpm test` - Run Jest tests
- `pnpm lint` - Run ESLint
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

**Core Services:**
- `src/services/gql.ts` - Apollo Client setup
- `src/services/wenqu.ts` - External book service API
- `src/services/urls.ts` - URL constants and routing

**Generated Code:**
- `src/gql/generated.tsx` - GraphQL types and hooks (auto-generated)
- `src/schema/` - GraphQL schema definitions

## Testing

- **Framework**: Jest with TypeScript support
- **Main test**: `/test/main.test.ts`
- **Coverage**: Uses v8 provider with text/lcov output
- **Setup**: `/test/setup.ts` for global test configuration

## Special Considerations

### GraphQL Schema Updates
When schema changes occur:
1. Download new schema from GraphQL endpoint
2. Place in `src/schema/` directory  
3. Run `pnpm codegen` to regenerate TypeScript types

### Environment Variables
- `CACHE_REDIS_URI` - Redis connection for caching
- `RSC_LOGGED_INFO_SECRET` - Server component logging
- `NEXT_PUBLIC_PP_TOKEN` - PromptPal integration token

### State Management Guidelines
- Use XState for complex UI flows with multiple states/transitions
- Use React Query for server state management and caching
- Combine both for auth flows and data-heavy operations

### Component Development
- Follow existing naming conventions (kebab-case dirs, PascalCase files)
- Use generated GraphQL types for all data operations
- Implement proper loading states and error boundaries
- Consider server/client component boundaries for optimal performance