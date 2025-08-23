import {
  ApolloLink,
  type OperationVariables,
  type QueryOptions,
} from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs'
import { redirect } from 'next/navigation'
import { authLink } from './ajax'
import { apolloCacheConfig, httpLink } from './apollo.shard'

const { getClient } = registerApolloClient(
  () =>
    new ApolloClient({
      cache: new InMemoryCache(apolloCacheConfig),
      link: ApolloLink.from([authLink, httpLink]),
    })
)

export const getApolloServerClient = getClient

export function doApolloServerQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(options: QueryOptions<TVariables, TData>) {
  return (
    getApolloServerClient()
      .query<TData, TVariables>(options)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        if (e instanceof CombinedGraphQLErrors) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const statusCode = (e.cause as any)?.info?.code as number
          if (statusCode === 401) {
            return redirect('/auth/auth-v4?clean=true')
          }
        }
        throw e
      })
  )
}
