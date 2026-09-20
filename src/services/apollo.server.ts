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
import { notFound, redirect } from 'next/navigation'
import { connection } from 'next/server'

import {
  LOCAL_GRAPHQL_URL,
  localGraphQLFetch,
} from '@/server/graphql/local-transport'

import {
  authLink,
  isNotFoundApolloError,
  isUnauthorizedApolloError,
} from './ajax'
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

export async function doApolloServerQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(options: QueryOptions<TVariables, TData>): Promise<{ data: TData }> {
  const client = await getApolloServerClient()
  return client
    .query(options)
    .then((result) => ({ data: result.data as TData }))
    .catch((e: unknown) => {
      if (isUnauthorizedApolloError(e)) {
        return redirect('/auth/auth-v4?clean=true')
      }
      // assertFound throws rather than returning null, so without this a missing
      // user reached the route's error.tsx instead of its not-found.tsx.
      if (isNotFoundApolloError(e)) {
        return notFound()
      }
      throw e
    })
}
