import {
  ApolloLink,
  HttpLink,
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

import { API_HOST } from '@/constants/config'
import { getServerEnv } from '@/server/env'

import { authLink } from './ajax'
import { apolloCacheConfig } from './apollo.shard'

export function getApolloServerGraphqlUrl() {
  const origin = API_HOST || getServerEnv().APP_ORIGIN
  return `${origin.replace(/\/$/, '')}/api/v2/graphql`
}

const { getClient } = registerApolloClient(() => {
  const httpLink = new HttpLink({ uri: getApolloServerGraphqlUrl() })
  return new ApolloClient({
    cache: new InMemoryCache(apolloCacheConfig),
    link: ApolloLink.from([authLink, httpLink]),
  })
})

export const getApolloServerClient = getClient

export function doApolloServerQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(options: QueryOptions<TVariables, TData>): Promise<{ data: TData }> {
  return getApolloServerClient()
    .query(options)
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
}
