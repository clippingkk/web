import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { apolloCacheConfig, httpLink } from "./apollo.shard";

const { getClient } = registerApolloClient(() => new ApolloClient({
  ssrMode: typeof window === 'undefined',
  cache: new InMemoryCache(apolloCacheConfig),
  link: ApolloLink.from([
    httpLink
  ]),
})
)

export const getApolloServerClient = getClient
