import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'

import { generateMetadata as squareGenerateMetadata } from '@/components/og/og-with-square-page'
import { APP_API_STEP_LIMIT } from '@/constants/config'
import {
  FetchSquareDataDocument,
  type FetchSquareDataQuery,
  type FetchSquareDataQueryVariables,
} from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import {
  doApolloServerQuery,
  getApolloServerClient,
} from '@/services/apollo.server'
import { isValidDoubanId, wenquBooksByIdsQueryOptions } from '@/services/wenqu'

import SquarePageContent from './content'

export async function generateMetadata(): Promise<Metadata> {
  const client = getApolloServerClient()
  const squareResponse = await client.query<
    FetchSquareDataQuery,
    FetchSquareDataQueryVariables
  >({
    query: FetchSquareDataDocument,
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      },
    },
  })

  const dbIds =
    squareResponse
      .data!.featuredClippings.map((x) => x.bookID)
      .filter(isValidDoubanId) ?? []

  const rq = getReactQueryClient()

  const bs = await rq.fetchQuery(wenquBooksByIdsQueryOptions(dbIds))

  return squareGenerateMetadata(bs.books)
}

async function Page() {
  const squareResponse = await doApolloServerQuery<
    FetchSquareDataQuery,
    FetchSquareDataQueryVariables
  >({
    query: FetchSquareDataDocument,
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      },
    },
  })

  const dbIds =
    squareResponse
      .data!.featuredClippings.map((x) => x.bookID)
      .filter(isValidDoubanId) ?? []

  const rq = getReactQueryClient()

  if (dbIds.length >= 1) {
    await rq.prefetchQuery(wenquBooksByIdsQueryOptions(dbIds))
  }

  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
      <SquarePageContent squareData={squareResponse.data!} />
    </HydrationBoundary>
  )
}

export default Page
