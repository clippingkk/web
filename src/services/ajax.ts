import { ApolloLink, HttpLink } from '@apollo/client'
import { onError } from "@apollo/client/link/error"
import { API_HOST } from '../constants/config'
import profile from '../utils/profile'
import toast from 'react-hot-toast'
import { QueryClient } from '@tanstack/react-query'
import { getLanguage } from '../utils/locales'
import { ApolloClient, InMemoryCache, SSRMultipartLink } from '@apollo/experimental-nextjs-app-support'
import Cookies from 'js-cookie'
import { cache } from 'react'
import { apolloCacheConfig } from './apollo.shard'

export interface IBaseResponseData<T> {
  status: number
  msg: string
  data: T
}

export function getLocalToken() {
  let lToken = ''

  if (typeof document !== 'undefined' && document.cookie) {
    lToken = Cookies.get('token') ?? ''
  }

  if (!lToken && typeof localStorage !== 'undefined') {
    lToken = localStorage.getItem('clippingkk-token') ?? ''
  }

  return lToken
}

// FIXME: 由于循环依赖的问题，这里避免引入 './profile'
// 但是 profile 中有一样的初始化获取逻辑
let token = getLocalToken()
// let token = localProfile?.token

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // set token if not exist
  if (!(options.headers as Record<string, string>)['Authorization'] && token) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  // set language if not exist
  if (!(options.headers as Record<string, string>)['X-Accept-Language']) {
    (options.headers as Record<string, string>)['X-Accept-Language'] = getLanguage()
  }

  options.credentials = 'include'
  options.mode = 'cors'
  if (!options.next) {
    options.next = {
      revalidate: 30 // 30 seconds
    }
  }

  const finalUrl = url.startsWith('http') ? url : `${API_HOST}/api${url}`

  try {
    const response: IBaseResponseData<T> = await fetch(finalUrl, options)
      .then(res => res.json())
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
  if (!options.next) {
    options.next = {
      revalidate: 60 * 60 * 2000
    }
  }
  return fetch(url, options)
}

export function updateToken(t: string) {
  token = t
}

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => {
    if (!token) {
      return headers
    }

    return {
      headers: {
        ...headers,
        'Authorization': `Bearer ${token}`,
        'X-Accept-Language': getLanguage()
      }
    }
  })

  return forward(operation)
})

type GraphQLResponseError = {
  name: string
  response: Response
  result: { code: number, error: string }
  statusCode: number
  message: string
}

const errorLink = onError((errData) => {
  const { graphQLErrors, networkError } = errData
  if (graphQLErrors) {
    // swal({
    //   icon: 'error',
    //   title: graphQLErrors[0].message,
    //   text: graphQLErrors[0].message,
    // })
    if (typeof window !== 'undefined') {
      toast.error(graphQLErrors[0].message)
    }
  }
  let ne = networkError as GraphQLResponseError

  if (ne) {
    console.log(`[Network error]: ${ne}`)
    if (typeof window !== 'undefined') {
      if (ne.statusCode && ne.statusCode === 401) {
        updateToken('')
        profile.onLogout()
      }
      // toast.error(`${ne.statusCode}: ${ne.name}`)
    }
  }
});

const httpLink = new HttpLink({
  uri: API_HOST + '/api/v2/graphql',
  fetch: apolloFetcher,
})

export function makeApolloClient() {
  const links: ApolloLink[] = []
  if (typeof window === 'undefined') {
    links.push(new SSRMultipartLink({ stripDefer: true }))
  }
  links.push(errorLink, authLink, httpLink)

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    cache: new InMemoryCache(apolloCacheConfig),
    link: ApolloLink.from(links),
    connectToDevTools: process.env.DEV === 'true',
  })
  // return new ApolloClient({
  //   ssrMode: typeof window === 'undefined',
  //   cache: new NextSSRInMemoryCache(),
  //   link: ApolloLink.from(links),
  //   connectToDevTools: process.env.DEV === 'true',
  // })
}

export function makeApolloClientWithCredentials(credentials: { uid?: number, token?: string }) {
  const token = credentials.token
  const authLinkRSC = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => {
      if (!token) {
        return headers
      }

      return {
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`,
          'X-Accept-Language': getLanguage()
        }
      }
    })

    return forward(operation)
  })

  // same as makeApolloClient
  return () => {
    const links: ApolloLink[] = []
    if (typeof window === 'undefined') {
      links.push(new SSRMultipartLink({ stripDefer: true }))
    }

    links.push(errorLink, authLinkRSC, httpLink)

    return new ApolloClient({
      ssrMode: typeof window === 'undefined',
      cache: new InMemoryCache(apolloCacheConfig),
      link: ApolloLink.from(links),
      connectToDevTools: process.env.DEV === 'true',
    })
  }
}

export function createReactQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60,
        gcTime: 60 * 60 * 3 // 3 hours
      },
    }
  })
}

export const getReactQueryClient = cache(() => createReactQueryClient())
