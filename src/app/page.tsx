import React from 'react'
import Footer from '../components/footer/Footer'
import { getReactQueryClient } from '../services/ajax'
import { wenquRequest, WenquSearchResponse } from '../services/wenqu'
import { PublicDataDocument, PublicDataQuery } from '../schema/generated'
import { duration3Days } from '../hooks/book'
import IndexPage from '../components/index-page/index.page'
import { useBackgroundImageServer as getBackgroundImageServer } from '../hooks/theme.server'
import { doApolloServerQuery } from '../services/apollo.server'

async function Page() {
  const data = await doApolloServerQuery<PublicDataQuery>({
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
  const bs = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
  const bgInfo = getBackgroundImageServer()
  return (
    <>
      <IndexPage
        bgInfo={bgInfo}
        publicData={data.data}
        books={bs.books}
      />
      <Footer />
    </>
  )
}

export default Page
