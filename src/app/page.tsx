import React from 'react'
import Footer from '../components/footer/Footer'
import { getReactQueryClient } from '../services/ajax'
import { wenquRequest, WenquSearchResponse } from '../services/wenqu'
import { PublicDataDocument, PublicDataQuery } from '../schema/generated'
import { duration3Days } from '../hooks/book'
import IndexPage from '../components/index-page/index.page'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { useBackgroundImageServer as getBackgroundImageServer } from '../hooks/theme.server'
import { getApolloServerClient } from '../services/apollo.server'

export const revalidate = 60 * 60 * 24 * 3 // 3 day

async function Page() {
  const client = getApolloServerClient()
  const data = await client.query<PublicDataQuery>({
    query: PublicDataDocument,
    fetchPolicy: 'network-only'
  })

  const dbIds = data.
    data.
    public.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  const rq = getReactQueryClient()
  await rq.prefetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
  const d = dehydrate(rq)
  const bgInfo = getBackgroundImageServer()
  return (
    <div>
      <HydrationBoundary state={d}>
        <IndexPage
          bgInfo={bgInfo}
          publicData={data.data}
        />
      </HydrationBoundary>
      <Footer />
    </div>
  )
}

export default Page
