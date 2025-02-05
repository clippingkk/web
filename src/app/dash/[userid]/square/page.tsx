import React from 'react'
import { APP_API_STEP_LIMIT } from '@/constants/config'
import { duration3Days } from '@/hooks/book'
import { FetchSquareDataQuery, FetchSquareDataQueryVariables, FetchSquareDataDocument } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import SquarePageContent from './content'
import { Metadata } from 'next'
import { generateMetadata as squareGenerateMetadata } from '@/components/og/og-with-square-page'
import { getApolloServerClient } from '@/services/apollo.server'

export async function generateMetadata(): Promise<Metadata> {
  const client = getApolloServerClient()
  const squareResponse = await client.query<FetchSquareDataQuery, FetchSquareDataQueryVariables>({
    query: FetchSquareDataDocument,
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      }
    },
  })

  const dbIds = squareResponse.
    data.
    featuredClippings.
    map(x => x.bookID).
    filter(x => x.length > 3) ?? []

  const rq = getReactQueryClient()

  const bs = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })

  return squareGenerateMetadata(bs.books)
}

async function Page() {
  const client = getApolloServerClient()
  const squareResponse = await client.query<FetchSquareDataQuery, FetchSquareDataQueryVariables>({
    query: FetchSquareDataDocument,
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      }
    },
  })

  const dbIds = squareResponse.
    data.
    featuredClippings.
    map(x => x.bookID).
    filter(x => x.length > 3) ?? []

  const rq = getReactQueryClient()

  if (dbIds.length >= 1) {
    await rq.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
  }

  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
      <SquarePageContent squareData={squareResponse.data} />
    </HydrationBoundary>
  )
}

export default Page
