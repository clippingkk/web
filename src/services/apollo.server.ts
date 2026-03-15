import {
  ApolloLink,
  ServerError,
  type OperationVariables,
  type QueryOptions,
} from '@apollo/client'
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
>(options: QueryOptions<TVariables, TData>): Promise<{ data: TData }> {
  return (
    getApolloServerClient()
      .query<TData, TVariables>(options)
      .then((result) => ({ data: result.data as TData }))
      .catch((e: any) => {
        if (e instanceof ServerError) {
          const statusCode = e.statusCode
          if (statusCode === 401) {
            return redirect('/auth/auth-v4?clean=true')
          }
        }
        throw e
      })
  )
}
