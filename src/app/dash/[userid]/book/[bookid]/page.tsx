import dayjs from 'dayjs'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import BookInfo from '@/components/book-info/book-info'
import Divider from '@/components/divider/divider'
import { generateMetadata as bookGenerateMetadata } from '@/components/og/og-with-book'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import {
  BookDocument,
  type BookQuery,
  type BookQueryVariables,
} from '@/gql/graphql'
import { duration3Days } from '@/hooks/book'
import { useTranslation } from '@/i18n'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import {
  type WenquBook,
  type WenquSearchResponse,
  wenquRequest,
} from '@/services/wenqu'
import BookPageContent from './content'

type PageProps = {
  params: Promise<{ bookid: string; userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { bookid, userid } = await props.params
  const dbId = bookid ?? ''
  const rq = getReactQueryClient()
  const bs = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbId', dbId],
    queryFn: () =>
      wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`),
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
  const { bookid, userid } = await props.params
  const ck = await cookies()
  const uidStr = ck.get(USER_ID_KEY)?.value
  const uid = uidStr ? parseInt(uidStr, 10) : undefined
  const dbId = bookid ?? ''

  const token = ck.get(COOKIE_TOKEN_KEY)?.value

  if (!uid) {
    return null
  }

  const ac = getApolloServerClient()

  const { data: clippingsData } = await ac.query<BookQuery, BookQueryVariables>(
    {
      query: BookDocument,
      variables: {
        id: ~~dbId,
        pagination: {
          limit: 10,
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
    }
  )

  const rq = getReactQueryClient()

  let bookData: WenquBook | null = null
  if (dbId && dbId.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', dbId],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`),
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
    const result = dayjs(clippingsData.book.lastReadingAt).diff(
      dayjs(clippingsData.book.startReadingAt),
      'd',
      false
    )
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
