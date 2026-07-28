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
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

import { API_HOST } from '@/constants/config'
import { getServerEnv } from '@/server/env'

import { authLink, isUnauthorizedApolloError } from './ajax'
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
    .catch((e: any) => {
      if (isUnauthorizedApolloError(e)) {
        return redirect('/auth/auth-v4?clean=true')
      }
      throw e
    })
}
