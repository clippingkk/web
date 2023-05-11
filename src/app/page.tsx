import React from 'react'
import Footer from '../components/footer/Footer'
import { client, reactQueryClient } from '../services/ajax'
import { wenquRequest, WenquSearchResponse } from '../services/wenqu'
import { PublicDataDocument, PublicDataQuery } from '../schema/generated'
import { duration3Days } from '../hooks/book'
import IndexPage from '../components/index-page/index.page'
import { Hydrate, dehydrate } from '@tanstack/react-query'
import { useBackgroundImageServer } from '../hooks/theme.server'

export const revalidate = 60 * 60 * 24 * 3 // 3 day

async function Page() {
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

  await reactQueryClient.prefetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    staleTime: duration3Days,
    cacheTime: duration3Days,
  })
  const d = dehydrate(reactQueryClient)
  const bgInfo = useBackgroundImageServer()
  return (
    <div>
      <Hydrate state={d}>
        <IndexPage
        bgInfo={bgInfo}
          hydratedStates={d}
          publicData={data.data}
        />
      </Hydrate>
      <Footer />
    </div>
  )
}

export default Page
