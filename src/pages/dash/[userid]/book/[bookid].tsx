import React, { useEffect, useMemo, useRef } from 'react'
import BookInfo from '../../../../components/book-info/book-info';
import ClippingItem from '../../../../components/clipping-item/clipping-item';
import Divider from '../../../../components/divider/divider';
import { changeBackground } from '../../../../store/app/type';
import { useDispatch } from 'react-redux';
import Head from 'next/head'
import { usePageTrack } from '../../../../hooks/tracke';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { IN_APP_CHANNEL } from '../../../../services/channel';
import { useRouter } from 'next/router'
import DashboardContainer from '../../../../components/dashboard-container/container';
import OGWithBook from '../../../../components/og/og-with-book';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../../services/wenqu';
import { useMasonaryColumnCount } from '../../../../hooks/use-screen-size';
import { Masonry, useInfiniteLoader } from 'masonic';
import { Clipping, useBookQuery, useQueryMyIdByDomainQuery } from '../../../../schema/generated';
import { reactQueryClient } from '../../../../services/ajax';
import { duration3Days, useSingleBook } from '../../../../hooks/book';
import { dehydrate } from '@tanstack/react-query';
import BookPageSkeleton from './skeleton';

function BookPage(serverResponse: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { userid: domain, bookid } = useRouter().query as { userid: string, bookid: string }
  usePageTrack('book', {
    bookId: bookid
  })
  const dispatch = useDispatch()
  const bookData = useSingleBook(bookid)

  const hasMore = useRef(true)
  const { data: clippingsData, fetchMore, loading } = useBookQuery({
    variables: {
      id: ~~bookid,
      pagination: {
        limit: 10,
        offset: 0
      }
    },
  })

  useEffect(() => {
    if (!bookData) {
      return
    }
    dispatch(changeBackground(bookData.image))
  }, [bookData, changeBackground])

  const { t } = useTranslation()

  const duration = useMemo(() => {
    if (!clippingsData?.book.startReadingAt || !clippingsData.book.lastReadingAt) {
      return undefined
    }
    const result = dayjs(clippingsData?.book.lastReadingAt)
      .diff(dayjs(clippingsData?.book.startReadingAt), 'd', false)
    return result || undefined
  }, [clippingsData?.book.startReadingAt, clippingsData?.book.lastReadingAt])

  const mappedMyData = useQueryMyIdByDomainQuery({
    variables: {
      domain
    },
    // 是 NaN 就是 domain 啦~
    skip: !Number.isNaN(parseInt(domain))
  })

  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader((startIndex, stopIndex, currentItems) => {
    if (!hasMore.current) {
      return
    }
    fetchMore({
      variables: {
        id: ~~bookid,
        pagination: {
          limit: 10,
          offset: currentItems.length
        }
      },
    })
  }, {
    threshold: 3,
    totalItems: clippingsData?.book.clippingsCount
  })

  if (!bookData) {
    return <BookPageSkeleton />
  }

  return (
    <section className='page anna-fade-in'>
      <Head>
        <title>{bookData?.title} - clippingkk</title>
        <OGWithBook book={bookData} domain={domain} />
      </Head>
      <BookInfo
        book={bookData}
        uid={mappedMyData.data?.me.id ?? (~~domain)}
        duration={duration}
        isLastReadingBook={clippingsData?.book.isLastReadingBook}
      />
      <Divider title={t('app.book.title')} />
      <div>
        <Masonry
          items={(clippingsData?.book.clippings ?? []) as Clipping[]}
          columnCount={masonaryColumnCount}
          columnGutter={30}
          onRender={maybeLoadMore}
          render={(row) => {
            const clipping = row.data
            return (
              <ClippingItem
                item={clipping}
                domain={domain}
                book={bookData}
                key={clipping.id}
                inAppChannel={IN_APP_CHANNEL.clippingFromBook}
              />
            )
          }}
        />
      </div>
    </section>
  )
}


type serverSideProps = {
}

export const getServerSideProps: GetServerSideProps<serverSideProps> = async (context) => {
  const dbId = context.params?.bookid ?? ''
  if (dbId && dbId.length > 3) {
    await reactQueryClient.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', dbId],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`),
      staleTime: duration3Days,
      cacheTime: duration3Days,
    })
  }
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )
  return {
    props: {
      dehydratedState: dehydrate(reactQueryClient),
    },
  }
}

BookPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default BookPage
