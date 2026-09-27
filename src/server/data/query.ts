import 'server-only'
import type {
  ApolloClient,
  DefaultContext,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client'

import { getApolloServerClient } from '@/services/apollo.server'

import { handleQueryError, type QueryErrorOptions } from './query-error'

export type ServerQueryOptions = QueryErrorOptions & {
  /** Apollo link context, e.g. extra headers for the in-process transport. */
  context?: DefaultContext
}

type NullableOptions = ServerQueryOptions &
  ({ notFound: 'null' } | { unauthorized: 'null' })

/**
 * Runs a GraphQL query in-process for a server component, always against the
 * network (never a stale per-request cache), and maps failures the same way on
 * every page -- see handleQueryError(). Resolves to the data, or to null only
 * when `notFound: 'null'` / `unauthorized: 'null'` asked for it.
 */
export function serverQuery<
  TData,
  TVars extends OperationVariables = OperationVariables,
>(
  doc: TypedDocumentNode<TData, TVars>,
  variables: TVars | undefined,
  opts: NullableOptions
): Promise<TData | null>
export function serverQuery<
  TData,
  TVars extends OperationVariables = OperationVariables,
>(
  doc: TypedDocumentNode<TData, TVars>,
  variables?: TVars,
  opts?: ServerQueryOptions & { notFound?: 'throw'; unauthorized?: 'redirect' }
): Promise<TData>
export async function serverQuery<
  TData,
  TVars extends OperationVariables = OperationVariables,
>(
  doc: TypedDocumentNode<TData, TVars>,
  variables?: TVars,
  opts: ServerQueryOptions = {}
): Promise<TData | null> {
  // Outside the try: connection() may throw Next's own prerender bailout.
  const client = await getApolloServerClient()
  try {
    const result = await client.query({
      query: doc,
      variables,
      fetchPolicy: 'network-only',
      context: opts.context,
    } as ApolloClient.QueryOptions<TData, TVars>)
    return result.data as TData
  } catch (error) {
    return handleQueryError(error, opts)
  }
}
