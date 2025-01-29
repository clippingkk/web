import React from 'react'
import { getReactQueryClient } from '@/services/ajax'
import { duration3Days } from '@/hooks/book'
import { WenquBook, wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import BookPageContent from './content'
import { Metadata } from 'next'
import { generateMetadata as bookGenerateMetadata } from '@/components/og/og-with-book'
import BookInfo from '@/components/book-info/book-info'
import { cookies } from 'next/headers'
import { getApolloServerClient } from '@/services/apollo.server'
import { BookDocument } from '@/schema/generated'
import dayjs from 'dayjs'
import Divider from '@/components/divider/divider'
import { useTranslation } from '@/i18n'

type PageProps = {
  params: Promise<{ bookid: string, userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { bookid, userid } = (await props.params)
  const dbId = bookid ?? ''
  const rq = getReactQueryClient()
  const bs = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbId', dbId],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })

  const b = bs.books.length === 1 ? bs.books[0] : null

  return bookGenerateMetadata(userid, b)
}

// <Head>
//   <title>{bookData?.title} - clippingkk</title>
//   <OGWithBook book={bookData} domain={domain} />
// </Head>

async function Page(props: PageProps) {
  const { t } = await useTranslation()
  const { bookid, userid } = (await props.params)
  const ck = await cookies()
  const uidStr = ck.get('uid')?.value
  const uid = uidStr ? parseInt(uidStr) : undefined
  const dbId = bookid ?? ''

  if (!uid) {
    return null
  }

  const ac = getApolloServerClient()

  const { data: clippingsData } = await ac.query({
    query: BookDocument,
    variables: {
      id: ~~bookid,
      pagination: {
        limit: 10,
        offset: 0
      }
    },
  })

  const rq = getReactQueryClient()

  let bookData: WenquBook | null = null
  if (dbId && dbId.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', dbId],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    bookData = bs.books.length === 1 ? bs.books[0] : null
  }

  if (!bookData || !clippingsData) {
    return null
  }
  let duration = 0
  if (clippingsData?.book.startReadingAt && clippingsData?.book.lastReadingAt) {
    const result = dayjs(clippingsData.book.lastReadingAt)
      .diff(dayjs(clippingsData.book.startReadingAt), 'd', false)
    duration = result || 0
  }

  return (
    <>
      <BookInfo
        book={bookData}
        uid={uid}
        duration={duration}
        isLastReadingBook={clippingsData.book.isLastReadingBook}
      />
      <Divider title={t('app.book.title')} />
      <BookPageContent book={bookData} userid={userid} />
    </>
  )
}

export default Page
