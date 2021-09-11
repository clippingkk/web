import React, { useState, useEffect, useMemo } from 'react'
import BookInfo from '../../../../components/book-info/book-info';
import ClippingItem from '../../../../components/clipping-item/clipping-item';
import ListFooter from '../../../../components/list-footer/list-footer';
import Divider from '../../../../components/divider/divider';
import { changeBackground } from '../../../../store/app/type';
import { useDispatch } from 'react-redux';
import Head from 'next/head'
import { usePageTrack, useTitle } from '../../../../hooks/tracke';
import { useSingleBook } from '../../../../hooks/book'
import { useQuery } from '@apollo/client';
import bookQuery from '../../../../schema/book.graphql'
import { book, bookVariables } from '../../../../schema/__generated__/book';
import { useTranslation } from 'react-i18next';
import MasonryContainer from '../../../../components/masonry-container';
import dayjs from 'dayjs';
import { IN_APP_CHANNEL } from '../../../../services/channel';
import styles from './book.module.css'
import { useRouter } from 'next/router'
import DashboardContainer from '../../../../components/dashboard-container/container';
import OGWithBook from '../../../../components/og/og-with-book';

function BookPage() {
  const { userid, bookid } = useRouter().query as { userid: string, bookid: string }
  usePageTrack('book', {
    bookId: bookid
  })
  const dispatch = useDispatch()
  const bookData = useSingleBook(bookid)

  const [hasMore, setHasMore] = useState(true)
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

  useTitle(bookData?.title)
  const { t } = useTranslation()

  const duration = useMemo(() => {
    if (!clippingsData?.book.startReadingAt || !clippingsData.book.lastReadingAt) {
      return undefined
    }
    const result = dayjs(clippingsData?.book.lastReadingAt)
      .diff(dayjs(clippingsData?.book.startReadingAt), 'd', false)
    return result || undefined
  }, [clippingsData?.book.startReadingAt, clippingsData?.book.lastReadingAt])

  if (!bookData) {
    return null
  }

  return (
    <section className={`${styles.bookPage} page anna-fade-in`}>
      <Head>
        <title>{bookData.title}</title>
        <OGWithBook book={bookData} uid={~~userid} />
        </Head>
      <BookInfo
        book={bookData}
        uid={~~userid}
        duration={duration}
        isLastReadingBook={clippingsData?.book.isLastReadingBook}
      />
      <Divider title={t('app.book.title')} />
      <MasonryContainer>
        <React.Fragment>
          {clippingsData?.book.clippings.map(clipping => (
            <ClippingItem
              item={clipping}
              userid={~~userid}
              book={bookData}
              key={clipping.id}
              inAppChannel={IN_APP_CHANNEL.clippingFromBook}
            />
          ))}
          <ListFooter
            loadMoreFn={() => {
              if (loading) {
                return
              }
              fetchMore({
                variables: {
                  id: ~~bookid,
                  pagination: {
                    limit: 10,
                    offset: clippingsData?.book.clippings.length
                  }
                },
                updateQuery: (prev: book, { fetchMoreResult }) => {
                  if (!fetchMoreResult) {
                    return prev
                  }
                  if (fetchMoreResult.book.clippings.length < 10) {
                    setHasMore(false)
                  }
                  return {
                    ...prev,
                    book: {
                      ...prev.book,
                      clippings: [...prev.book.clippings, ...fetchMoreResult.book.clippings]
                    }
                  }
                }
              })
            }}
            hasMore={hasMore}
          />
        </React.Fragment>
      </MasonryContainer>
    </section>
  )
}

BookPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default BookPage

