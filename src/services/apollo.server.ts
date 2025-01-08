import { ApolloLink } from '@apollo/client'
import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/experimental-nextjs-app-support'
import { apolloCacheConfig, httpLink } from './apollo.shard'
import { authLink } from './ajax'

const { getClient } = registerApolloClient(() => new ApolloClient({
  cache: new InMemoryCache(apolloCacheConfig),
  link: ApolloLink.from([
    httpLink,
    authLink,
  ]),
})
)

export const getApolloServerClient = getClient
