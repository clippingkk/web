import { CombinedGraphQLErrors, ServerError } from '@apollo/client'

export type ApolloErrorKind = 'unauthorized' | 'not_found' | 'forbidden'

/** Most actionable first: a missing session outranks anything it hides. */
const PRECEDENCE: readonly ApolloErrorKind[] = [
  'unauthorized',
  'not_found',
  'forbidden',
]

function kindOf(extensions?: Record<string, unknown>): ApolloErrorKind | null {
  const code = extensions?.code
  const status = (extensions?.http as { status?: unknown } | undefined)?.status
  if (code === 'UNAUTHORIZED' || status === 401) return 'unauthorized'
  if (code === 'NOT_FOUND' || status === 404) return 'not_found'
  if (code === 'FORBIDDEN' || status === 403) return 'forbidden'
  return null
}

/**
 * What a failed Apollo operation means for the page, read from the resolver's
 * `extensions.code` or `extensions.http.status` (src/server/graphql/yoga.ts
 * maskError sets both for an ApiError).
 *
 * A transport-level 404 is deliberately not "not found": it means the GraphQL
 * endpoint itself was misrouted, and rendering a not-found page for it would
 * hide a broken deployment. A transport-level 401 is still a lost session.
 */
export function classifyApolloError(error: unknown): ApolloErrorKind | null {
  if (ServerError.is(error))
    return error.statusCode === 401 ? 'unauthorized' : null
  if (!CombinedGraphQLErrors.is(error)) return null
  const kinds = new Set(error.errors.map((item) => kindOf(item.extensions)))
  return PRECEDENCE.find((kind) => kinds.has(kind)) ?? null
}
