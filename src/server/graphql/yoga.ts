import { GraphQLError } from 'graphql'
import { createYoga, maskError as defaultMaskError } from 'graphql-yoga'

import { ApiError } from '../errors'
import { createGraphQLContext } from './context'
import { graphQLSchema } from './schema'

export const GRAPHQL_ENDPOINT = '/api/v2/graphql'

/**
 * envelop only lets an error through unmasked when it is a GraphQLError whose
 * whole `originalError` chain is also GraphQLError. An ApiError never is, so by
 * default every deliberate 401/404 reached the client as "Unexpected error."
 * with no extensions -- which is how a "user not found" took down a whole RSC
 * render instead of becoming a notFound(), and why every masked error shared one
 * Next.js digest.
 *
 * ApiError messages are already written for the reader and carry a status and a
 * code, so they are safe to surface. Everything else stays masked.
 */
export function maskError(error: unknown, message: string, isDev?: boolean) {
  const original =
    error instanceof GraphQLError ? (error.originalError ?? error) : error
  if (original instanceof ApiError)
    return new GraphQLError(original.message, {
      extensions: {
        code: original.code,
        http: { status: original.status },
      },
    })
  return defaultMaskError(error, message, isDev)
}

export const yoga = createYoga({
  schema: graphQLSchema,
  graphqlEndpoint: GRAPHQL_ENDPOINT,
  context: createGraphQLContext,
  cors: false,
  graphiql: process.env.NODE_ENV !== 'production',
  maskedErrors: process.env.NODE_ENV === 'production' ? { maskError } : false,
})
