import {
  ApolloLink,
  CombinedGraphQLErrors,
  HttpLink,
  ServerError,
} from '@apollo/client'
import {
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs'
import { onError } from '@apollo/client/link/error'
import { QueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { cache } from 'react'
import toast from 'react-hot-toast'

import { API_HOST } from '../constants/config'
import { COOKIE_TOKEN_KEY } from '../constants/storage'
import type { ApiResponse } from '../contracts/http'
import { getLanguage } from '../utils/locales'
import profile from '../utils/profile'
import { apolloCacheConfig } from './apollo.shard'

export function getLocalToken() {
  let lToken = ''

  if (typeof document !== 'undefined' && document.cookie) {
    lToken = Cookies.get(COOKIE_TOKEN_KEY) ?? ''
  }

  if (!lToken && typeof localStorage !== 'undefined') {
    lToken = localStorage.getItem('clippingkk-token') ?? ''
  }

  return lToken
}

// FIXME: 由于循环依赖的问题，这里避免引入 './profile'
// 但是 profile 中有一样的初始化获取逻辑
let token = typeof window === 'undefined' ? null : getLocalToken()
// let token = localProfile?.token

export async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)

  // set token if not exist
  if (!headers.has('Authorization') && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // set language if not exist
  if (!headers.has('X-Accept-Language')) {
    headers.set('X-Accept-Language', getLanguage())
  }

  const finalUrl = url.startsWith('http') ? url : `${API_HOST}/api${url}`

  try {
    const fetchResponse = await fetch(finalUrl, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    })
    const response = (await fetchResponse.json()) as ApiResponse<T>
    if (!fetchResponse.ok || response.status >= 400 || !('data' in response)) {
      throw new Error(response.msg)
    }

    return response.data
  } catch (e) {
    toast.error('请求挂了... 一会儿再试试')
    return Promise.reject(e)
  }
}

type JsonRequestMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type JsonRequestOptions = Omit<RequestInit, 'body' | 'method'>

export function requestJson<TResponse, TBody>(
  url: string,
  method: JsonRequestMethod,
  payload: TBody,
  options: JsonRequestOptions = {}
): Promise<TResponse> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return request<TResponse>(url, {
    ...options,
    method,
    headers,
    body: JSON.stringify(payload),
  })
}

function apolloFetcher(url: RequestInfo | URL, options: RequestInit = {}) {
  return fetch(url, options)
}

export function updateToken(t: string) {
  token = t
}

export const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} as Record<string, string> }) => {
    if (
      typeof window !== 'undefined' &&
      !('Authorization' in headers) &&
      token
    ) {
      headers.Authorization = `Bearer ${token}`
    }

    return {
      headers: {
        'X-Accept-Language': getLanguage(),
        ...headers,
        // 'Authorization': `Bearer ${token}`,
      },
    }
  })

  return forward(operation)
})

export function isUnauthorizedApolloError(error: unknown) {
  if (error instanceof ServerError) return error.statusCode === 401
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphQLError) => graphQLError.extensions?.code === 'UNAUTHORIZED'
    )
  )
}

const errorLink = onError(({ error }) => {
  if (isUnauthorizedApolloError(error)) {
    if (typeof window !== 'undefined') {
      updateToken('')
      profile.onLogout()
    }
  } else if (CombinedGraphQLErrors.is(error)) {
    if (typeof window !== 'undefined') {
      toast.error(error.errors[0].message)
    }
  } else if (error instanceof ServerError) {
    console.log(`[Network error]: ${error}`)
  }
})

const httpLink = new HttpLink({
  uri: `${API_HOST}/api/v2/graphql`,
  fetch: apolloFetcher,
})

export function makeApolloClient() {
  const links: ApolloLink[] = []
  if (typeof window === 'undefined') {
    links.push(new SSRMultipartLink({ stripDefer: true }))
  }
  links.push(errorLink, authLink, httpLink)

  return new ApolloClient({
    cache: new InMemoryCache(apolloCacheConfig),
    link: ApolloLink.from(links),
    devtools: { enabled: process.env.NODE_ENV !== 'production' },
  })
  // return new ApolloClient({
  //   ssrMode: typeof window === 'undefined',
  //   cache: new NextSSRInMemoryCache(),
  //   link: ApolloLink.from(links),
  //   devtools: { enabled: process.env.NODE_ENV !== 'production' },
  // })
}

export function makeApolloClientWithCredentials() {
  // same as makeApolloClient
  return () => {
    const links: ApolloLink[] = []
    if (typeof window === 'undefined') {
      links.push(new SSRMultipartLink({ stripDefer: true }))
    }

    links.push(errorLink, authLink, httpLink)

    return new ApolloClient({
      cache: new InMemoryCache(apolloCacheConfig),
      link: ApolloLink.from(links),
      devtools: { enabled: process.env.NODE_ENV !== 'production' },
    })
  }
}

export function createReactQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60,
        gcTime: 5000,
      },
    },
  })
}

export const getReactQueryClient = cache(() => createReactQueryClient())
