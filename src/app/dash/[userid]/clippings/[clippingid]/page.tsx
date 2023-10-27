import React from 'react'
import { duration3Days } from '@/hooks/book'
import { FetchClippingQuery, FetchClippingQueryVariables, FetchClippingDocument } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { WenquBook, wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import ClippingPageContent from './content'
import { generateMetadata as clippingGenerateMetadata } from '@/components/og/og-with-clipping'
import { Metadata } from 'next'
import { getApolloServerClient } from '@/services/apollo.server'

type PageProps = {
  params: { clippingid: string, userid: string }
  searchParams: { iac: string }
}
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { clippingid, userid } = props.params
  const cid = ~~clippingid

  const client = getApolloServerClient()
  const clippingsResponse = await client.query<FetchClippingQuery, FetchClippingQueryVariables>({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid,
    },
  })

  const rq = getReactQueryClient()
  const bookID = clippingsResponse.data.clipping.bookID
  let b: WenquBook | null = null
  if (bookID && bookID.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    b = bs.books.length === 1 ? bs.books[0] : null
  }

  return clippingGenerateMetadata({
    clipping: clippingsResponse.data.clipping,
    book: b
  })
}


async function Page(props: PageProps) {
  const { clippingid, userid } = props.params
  const cid = ~~clippingid
  const client = getApolloServerClient()
  const clippingsResponse = await client.query<FetchClippingQuery, FetchClippingQueryVariables>({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid,
    },
  })

  const bookID = clippingsResponse.data.clipping.bookID
  const rq = getReactQueryClient()
  if (bookID && bookID.length > 3) {
    await rq.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
  }
  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
      <ClippingPageContent
        cid={cid}
        clipping={clippingsResponse.data}
        iac={props.searchParams.iac}
      />
    </HydrationBoundary>
  )
}

export default Page
