import { ApolloLink } from "@apollo/client";
import { registerApolloClient, ApolloClient, InMemoryCache } from "@apollo/experimental-nextjs-app-support";
import { apolloCacheConfig, httpLink } from "./apollo.shard";

const { getClient } = registerApolloClient(() => new ApolloClient({
  cache: new InMemoryCache(apolloCacheConfig),
  link: ApolloLink.from([
    httpLink
  ]),
})
)

export const getApolloServerClient = getClient
