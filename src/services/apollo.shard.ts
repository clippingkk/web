import { HttpLink, InMemoryCacheConfig } from '@apollo/client'
import { API_HOST } from '../constants/config';

function apolloFetcher(url: string, options: RequestInit = {}) {
  if (!options.next) {
    options.next = {
      revalidate: 60 * 60 * 2000
    }
  }
  return fetch(url, options)
}

export type GraphQLResponseError = {
  name: string
  response: Response
  result: { code: number, error: string }
  statusCode: number
  message: string
}

export const httpLink = new HttpLink({
  uri: API_HOST + '/api/v2/graphql',
  fetch: apolloFetcher,
})

export const apolloCacheConfig: InMemoryCacheConfig = {
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

}

function simpleDistArrayMerge(existings: { __ref: string }[] = [], incoming: { __ref: string }[] = []) {
  return [...existings, ...incoming].reduce((acc, x) => {
    if (acc.findIndex((z: any) => z.__ref === x.__ref) === -1) {
      acc.push(x)
    }
    return acc
  }, [] as any[])
}
