import { ApolloError, ApolloLink, OperationVariables, QueryOptions } from '@apollo/client'
import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/experimental-nextjs-app-support'
import { apolloCacheConfig, httpLink } from './apollo.shard'
import { authLink } from './ajax'
import { redirect } from 'next/navigation'

const { getClient } = registerApolloClient(() => new ApolloClient({
  cache: new InMemoryCache(apolloCacheConfig),
  link: ApolloLink.from([
    httpLink,
    authLink,
  ]),
})
)

export const getApolloServerClient = getClient

export function doApolloServerQuery<TData, TVariables extends OperationVariables = OperationVariables>(
  options: QueryOptions<TVariables, TData>
) {
  return getApolloServerClient()
    .query<TData, TVariables>(options)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((e: any) => {
      if (e instanceof ApolloError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (e.cause as any)?.info?.code as number
        if (statusCode === 401) {
          return redirect('/auth/auth-v4?clean=true')
        }
      }
      throw e
    })
}