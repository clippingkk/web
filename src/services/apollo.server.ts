import {
  ApolloLink,
  HttpLink,
  type OperationVariables,
  type QueryOptions,
} from '@apollo/client'
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs'
import { connection } from 'next/server'

import { handleQueryError } from '@/server/data/query-error'
import {
  LOCAL_GRAPHQL_URL,
  localGraphQLFetch,
} from '@/server/graphql/local-transport'

import { authLink } from './ajax'
import { apolloCacheConfig } from './apollo.shard'

const { getClient } = registerApolloClient(() => {
  // The API lives in this very process, so skip the network entirely instead of
  // paying DNS + TLS + a public load balancer round-trip to reach ourselves.
  const httpLink = new HttpLink({
    uri: LOCAL_GRAPHQL_URL,
    fetch: localGraphQLFetch,
  })
  return new ApolloClient({
    cache: new InMemoryCache(apolloCacheConfig),
    link: ApolloLink.from([authLink, httpLink]),
  })
})

export async function getApolloServerClient() {
  await connection()
  return getClient()
}

/**
 * @deprecated Use serverQuery() from '@/server/data/query'. Kept so existing
 * pages compile; it maps errors exactly like serverQuery() (sign-in redirect
 * with `next` for UNAUTHORIZED, notFound() for NOT_FOUND and FORBIDDEN).
 */
export async function doApolloServerQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(options: QueryOptions<TVariables, TData>): Promise<{ data: TData }> {
  const client = await getApolloServerClient()
  try {
    const result = await client.query(options)
    return { data: result.data as TData }
  } catch (error) {
    await handleQueryError(error)
    // handleQueryError only resolves when asked to; with defaults it throws.
    throw error
  }
}
