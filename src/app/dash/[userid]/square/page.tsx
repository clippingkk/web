import React from 'react'
import { APP_API_STEP_LIMIT } from '../../../../constants/config'
import { duration3Days } from '../../../../hooks/book'
import { FetchSquareDataQuery, FetchSquareDataQueryVariables, FetchSquareDataDocument } from '../../../../schema/generated'
import { client, reactQueryClient } from '../../../../services/ajax'
import { wenquRequest, WenquSearchResponse } from '../../../../services/wenqu'
import { Hydrate, dehydrate } from '@tanstack/react-query'
import SquarePageContent from './content'
import { Metadata } from 'next'

type PageProps = {
}

export const metadata: Metadata = {
  title: 'Square'
}
// <Head>
//   <title>square - clippingkk</title>
//   <OGWithSquare books={books.books ?? []} />
// </Head>

async function Page(props: PageProps) {
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

  if (dbIds.length >= 1) {
    await reactQueryClient.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
      staleTime: duration3Days,
      cacheTime: duration3Days,
    })
  }

  const d = dehydrate(reactQueryClient)

  return (
    <Hydrate state={d}>
      <SquarePageContent squareData={squareResponse.data} />
    </Hydrate>
  )
}

export default Page
