import { generateMetadata as squareGenerateMetadata } from '@/components/og/og-with-square-page'
import { APP_API_STEP_LIMIT } from '@/constants/config'
import { duration3Days } from '@/hooks/book'
import {
  FetchSquareDataDocument,
  FetchSquareDataQuery,
  FetchSquareDataQueryVariables,
} from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import {
  doApolloServerQuery,
  getApolloServerClient,
} from '@/services/apollo.server'
import { wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Metadata } from 'next'
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
    squareResponse.data.featuredClippings
      .map((x) => x.bookID)
      .filter((x) => x.length > 3) ?? []

  const rq = getReactQueryClient()

  const bs = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () =>
      wenquRequest<WenquSearchResponse>(
        `/books/search?dbIds=${dbIds.join('&dbIds=')}`
      ),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })

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
    squareResponse.data.featuredClippings
      .map((x) => x.bookID)
      .filter((x) => x.length > 3) ?? []

  const rq = getReactQueryClient()

  if (dbIds.length >= 1) {
    await rq.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(
          `/books/search?dbIds=${dbIds.join('&dbIds=')}`
        ),
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
