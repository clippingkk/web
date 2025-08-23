import { ApolloLink, HttpLink } from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { ErrorLink } from '@apollo/client/link/error'
import {
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs'
import { QueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { cache } from 'react'
import toast from 'react-hot-toast'
import { API_HOST } from '../constants/config'
import { COOKIE_TOKEN_KEY } from '../constants/storage'
import { getLanguage } from '../utils/locales'
import profile from '../utils/profile'
import { apolloCacheConfig } from './apollo.shard'

export interface IBaseResponseData<T> {
  status: number
  msg: string
  data: T
}

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
  // set token if not exist
  if (!(options.headers as Record<string, string>).Authorization && token) {
    ;(options.headers as Record<string, string>).Authorization =
      `Bearer ${token}`
  }

  // set language if not exist
  if (!(options.headers as Record<string, string>)['X-Accept-Language']) {
    ;(options.headers as Record<string, string>)['X-Accept-Language'] =
      getLanguage()
  }

  options.credentials = 'include'
  options.mode = 'cors'

  const finalUrl = url.startsWith('http') ? url : `${API_HOST}/api${url}`

  try {
    const response: IBaseResponseData<T> = await fetch(finalUrl, options).then(
      (res) => res.json()
    )
    if (response.status >= 400) {
      throw new Error(response.msg)
    }

    return response.data as T
  } catch (e) {
    toast.error('请求挂了... 一会儿再试试')
    return Promise.reject(e)
  }
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

type GraphQLResponseError = {
  name: string
  response: Response
  result: { code: number; error: string }
  statusCode: number
  message: string
}

const errorLink = new ErrorLink(({ error }) => {
  // Check if it's a GraphQL error using the new API
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message }) => {
      if (typeof window !== 'undefined') {
        toast.error(message)
      }
    })
  } else {
    // Handle network errors
    const ne = error as unknown as GraphQLResponseError
    console.log(`[Network error]: ${ne}`)
    if (typeof window !== 'undefined' && ne.statusCode === 401) {
      updateToken('')
      profile.onLogout()
    }
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
  })
  // return new ApolloClient({
  //   ssrMode: typeof window === 'undefined',
  //   cache: new NextSSRInMemoryCache(),
  //   link: ApolloLink.from(links),
  //   connectToDevTools: process.env.DEV === 'true',
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
