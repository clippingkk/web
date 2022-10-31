import React, { useState, useEffect, useMemo, useRef } from 'react'
import BookInfo from '../../../../components/book-info/book-info';
import ClippingItem from '../../../../components/clipping-item/clipping-item';
import ListFooter from '../../../../components/list-footer/list-footer';
import Divider from '../../../../components/divider/divider';
import { changeBackground } from '../../../../store/app/type';
import { useDispatch } from 'react-redux';
import Head from 'next/head'
import { usePageTrack } from '../../../../hooks/tracke';
import { useQuery } from '@apollo/client';
import bookQuery from '../../../../schema/book.graphql'
import myIdByDomainQuery from '../../../../schema/myIdByDomain.graphql'
import { book, bookVariables, book_book_clippings } from '../../../../schema/__generated__/book'
import { queryMyIdByDomain, queryMyIdByDomainVariables } from '../../../../schema/__generated__/queryMyIdByDomain'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { IN_APP_CHANNEL } from '../../../../services/channel';
import styles from './book.module.css'
import { useRouter } from 'next/router'
import DashboardContainer from '../../../../components/dashboard-container/container';
import OGWithBook from '../../../../components/og/og-with-book';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../../services/wenqu';
import { useMasonaryColumnCount } from '../../../../hooks/use-screen-size';
import { Masonry, useInfiniteLoader } from 'masonic';

function BookPage(serverResponse: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { userid: domain, bookid } = useRouter().query as { userid: string, bookid: string }
  usePageTrack('book', {
    bookId: bookid
  })
  const dispatch = useDispatch()
  const bookData = serverResponse.bookServerData

  const hasMore = useRef(true)
  const { data: clippingsData, fetchMore, loading } = useQuery<book, bookVariables>(bookQuery, {
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

  const mappedMyData = useQuery<queryMyIdByDomain, queryMyIdByDomainVariables>(myIdByDomainQuery, {
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
    return null
  }

  return (
    <section className='page anna-fade-in'>
      <Head>
        <title>{bookData.title} - clippingkk</title>
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
          items={(clippingsData?.book.clippings ?? []) as book_book_clippings[]}
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
  bookServerData: WenquBook | null
}

export const getServerSideProps: GetServerSideProps<serverSideProps> = async (context) => {
  const dbId = context.params?.bookid ?? ''
  if (dbId.length <= 3) {
    return {
      props: {
        bookServerData: null
      }
    }
  }
  const book = await wenquRequest<WenquSearchResponse>(`/books/search?dbId=${dbId}`).then(bs => {
    if (bs.count !== 1) {
      return null
    }
    return bs.books[0]
  })
  return {
    props: {
      bookServerData: book
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

