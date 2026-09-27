import { ApolloLink, HttpLink } from '@apollo/client'
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs'
import { connection } from 'next/server'

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
