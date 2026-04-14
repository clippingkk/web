import dayjs from 'dayjs'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

import BookInfo from '@/components/book-info/book-info'
import BookInfoSkeleton from '@/components/book-info/book-info-skeleton'
import Divider from '@/components/divider/divider'
import { generateMetadata as bookGenerateMetadata } from '@/components/og/og-with-book'
import { BOOK_CLIPPINGS_PAGE_SIZE } from '@/constants/features'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { getTranslation } from '@/i18n'
import {
  BookDocument,
  type BookQuery,
  type BookQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'
import { getWenquBookByDbId } from '@/services/wenqu'

import BookPageContent from './content'

type PageProps = {
  params: Promise<{ bookid: string; userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { bookid, userid } = await props.params
  const dbId = bookid ?? ''
  const b = await getWenquBookByDbId(dbId)

  return bookGenerateMetadata(userid, b)
}

// <Head>
//   <title>{bookData?.title} - clippingkk</title>
//   <OGWithBook book={bookData} domain={domain} />
// </Head>

async function Page(props: PageProps) {
  const { t } = await getTranslation()
  const { bookid, userid } = await props.params
  const ck = await cookies()
  const uidStr = ck.get(USER_ID_KEY)?.value
  const uid = uidStr ? parseInt(uidStr, 10) : undefined
  const dbId = bookid ?? ''

  const token = ck.get(COOKIE_TOKEN_KEY)?.value

  if (!uid) {
    return null
  }

  const { data: clippingsData } = await doApolloServerQuery<
    BookQuery,
    BookQueryVariables
  >({
    query: BookDocument,
    variables: {
      id: ~~dbId,
      pagination: {
        limit: BOOK_CLIPPINGS_PAGE_SIZE,
        offset: 0,
      },
    },
    context: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  })

  const bookData = await getWenquBookByDbId(dbId)

  if (!bookData || !clippingsData) {
    return null
  }
  let duration = 0
  if (clippingsData?.book.startReadingAt && clippingsData?.book.lastReadingAt) {
    const result = dayjs(clippingsData.book.lastReadingAt).diff(
      dayjs(clippingsData.book.startReadingAt),
      'd',
      false
    )
    duration = result || 0
  }

  const clippingsCount = clippingsData.book.clippingsCount ?? 0

  return (
    <>
      <Suspense fallback={<BookInfoSkeleton />}>
        <BookInfo
          bookId={dbId}
          uid={uid}
          duration={duration}
          isLastReadingBook={clippingsData.book.isLastReadingBook}
          clippingsCount={clippingsCount}
          startReadingAt={clippingsData.book.startReadingAt}
          lastReadingAt={clippingsData.book.lastReadingAt}
        />
      </Suspense>
      <Divider
        title={
          clippingsCount > 0
            ? `${clippingsCount} ${t('app.book.title')}`
            : t('app.book.title')
        }
      />
      <BookPageContent book={bookData} userid={userid} />
    </>
  )
}

export default Page
