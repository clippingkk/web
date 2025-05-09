import { HttpLink, InMemoryCacheConfig } from '@apollo/client'
import { API_HOST } from '../constants/config'
import { uniqBy } from 'lodash'
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'

if (process.env.NODE_ENV !== 'production') {
  // Adds messages only in a dev environment
  loadDevMessages()
  loadErrorMessages()
}

function apolloFetcher(url: RequestInfo | URL, options: RequestInit = {}) {
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
        books: {
          keyArgs: ['doubanId'],
          merge: simpleDistArrayMerge
        }
      }
    },
    Book: {
      keyFields: ['doubanId'],
      fields: {
        clippings: {
          merge: simpleDistArrayMerge
        }
      }
    },
    ClippingListResponse: {
      fields: {
        items: {
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
  return uniqBy([...existings, ...incoming], '__ref')
}
