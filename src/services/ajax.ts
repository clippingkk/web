import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { onError } from "@apollo/client/link/error"
import { API_HOST, WENQU_API_HOST, WENQU_SIMPLE_TOKEN } from '../constants/config'
import profile from '../utils/profile'
import toast from 'react-hot-toast'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { QueryClient } from '@tanstack/react-query'

export interface IBaseResponseData<T> {
  status: Number
  msg: string
  data: T
}

export function getLocalToken() {
  return localStorage.getItem('clippingkk-token')
}

// FIXME: 由于循环依赖的问题，这里避免引入 './profile'
// 但是 profile 中有一样的初始化获取逻辑
let token = (process.browser) ? getLocalToken() : ''
// let token = localProfile?.token

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (token) {
    options.headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    }
  }
  options.credentials = 'include'
  options.mode = 'cors'

  try {
    const response: IBaseResponseData<T> = await fetch(API_HOST + '/api' + url, options).then(res => res.json())
    if (response.status >= 400) {
      throw new Error(response.msg)
    }

    return response.data as T
  } catch (e) {
    toast.error('请求挂了... 一会儿再试试')
    return Promise.reject(e)
  }
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
        'Authorization': `Bearer ${token}`
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
    toast.error(graphQLErrors[0].message)
  }
  let ne = networkError as GraphQLResponseError

  if (ne) {
    console.log(`[Network error]: ${ne}`)
    if (ne.statusCode && ne.statusCode === 401) {
      updateToken('')
      profile.onLogout()
    }
    toast.error(`${ne.statusCode}: ${ne.name}`)
    // swal({
    //   icon: 'error',
    //   title: `${ne.statusCode}: ${ne.name}`,
    //   text: ne.result?.error
    // })
  }
});

const httpLink = new HttpLink({
  uri: API_HOST + '/api/v2/graphql',
})

export const client = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // featuredClippings: offsetLimitPagination(false)
          featuredClippings: {
            keyArgs: false,
            merge(p = [], n) {
              return [...p, ...n]
            }
          },
          books: {
            keyArgs: ['doubanId'],
            merge(p = [], n) {
              return [...p, ...n]
            }
          }
        }
      },
      Book: {
        keyFields: ["doubanId"],
        fields: {
          clippings: {
            merge: simpleDistArrayMerge
          }
        }
      },
      User: {
        fields: {
          recents: {
            merge: simpleDistArrayMerge
          }
        }
      }
    }
  }),
  link: errorLink.concat(authLink.concat(httpLink)),
  connectToDevTools: process.env.DEV === 'true',
})

function simpleDistArrayMerge(existings: { __ref: string }[] = [], incoming: { __ref: string }[] = []) {
  return [...existings, ...incoming].reduce((acc, x) => {
    if (acc.findIndex((z: any) => z.__ref === x.__ref) === -1) {
      acc.push(x)
    }
    return acc
  }, [] as any[])
}

export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
    }
  }
})
