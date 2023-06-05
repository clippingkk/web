import React from 'react'
import { reactQueryClient } from '../../../../../services/ajax'
import { Hydrate, dehydrate } from '@tanstack/react-query'
import { duration3Days } from '../../../../../hooks/book'
import { wenquRequest, WenquSearchResponse } from '../../../../../services/wenqu'
import BookPageContent from './content'
import { Metadata } from 'next'
import { generateMetadata as bookGenerateMetadata } from '../../../../../components/og/og-with-book'

type PageProps = {
  params: { bookid: string, userid: string }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { bookid, userid } = props.params
  const dbId = bookid ?? ''
  const bs = await reactQueryClient.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbId', dbId],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`),
    staleTime: duration3Days,
    cacheTime: duration3Days,
  })

  const b = bs.books.length === 1 ? bs.books[0] : null

  return bookGenerateMetadata(userid, b)
}

// <Head>
//   <title>{bookData?.title} - clippingkk</title>
//   <OGWithBook book={bookData} domain={domain} />
// </Head>

async function Page(props: PageProps) {
  const { bookid, userid } = props.params
  const dbId = bookid ?? ''
  if (dbId && dbId.length > 3) {
    await reactQueryClient.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', dbId],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`),
      staleTime: duration3Days,
      cacheTime: duration3Days,
    })
  }

  const d = dehydrate(reactQueryClient)

  return (
    <Hydrate state={d}>
      <BookPageContent bookid={bookid} userid={userid} />
    </Hydrate>
  )
}

export default Page