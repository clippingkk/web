'use client'
import React, { useEffect, useMemo, useRef } from 'react'
import BookInfo from '@/components/book-info/book-info'
import ClippingItem from '@/components/clipping-item/clipping-item'
import Divider from '@/components/divider/divider'
import { changeBackground } from '@/store/app/type'
import { useDispatch } from 'react-redux'
import { usePageTrack } from '@/hooks/tracke'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { IN_APP_CHANNEL } from '@/services/channel'
import { useMasonaryColumnCount } from '@/hooks/use-screen-size'
import { Masonry, useInfiniteLoader } from 'masonic'
import { BookDocument, BookQuery, Clipping, QueryMyIdByDomainDocument, QueryMyIdByDomainQuery } from '@/schema/generated'
import { useSingleBook } from '@/hooks/book'
import BookPageSkeleton from './skeleton'
import { skipToken, useSuspenseQuery, useQuery } from '@apollo/client'

type BookPageContentProps = {
  userid: string
  bookid: string
}

function BookPageContent(props: BookPageContentProps) {
  const { userid: domain, bookid } = props
  usePageTrack('book', {
    bookId: bookid
  })
  const dispatch = useDispatch()
  const bookData = useSingleBook(bookid)

  const hasMore = useRef(true)
  const { data: clippingsData, fetchMore } = useQuery<BookQuery>(BookDocument, {
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
    if (!clippingsData?.book.startReadingAt || !clippingsData?.book.lastReadingAt) {
      return undefined
    }
    const result = dayjs(clippingsData.book.lastReadingAt)
      .diff(dayjs(clippingsData.book.startReadingAt), 'd', false)
    return result || undefined
  }, [clippingsData?.book.startReadingAt, clippingsData?.book.lastReadingAt])

  const mappedMyData = useSuspenseQuery<QueryMyIdByDomainQuery>(
    QueryMyIdByDomainDocument,
    // 是 NaN 就是 domain 啦~
    Number.isNaN(parseInt(domain)) ? {
      variables: {
        domain
      },
    } : skipToken)

  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader((startIndex, stopIndex, currentItems) => {
    if (!hasMore.current) {
      return Promise.reject(1)
    }
    return fetchMore({
      variables: {
        id: ~~bookid,
        pagination: {
          limit: 10,
          offset: currentItems.length
        }
      },
    })
  }, {
    isItemLoaded: (index, items) => !!items[index],
    threshold: 3,
    totalItems: clippingsData?.book.clippingsCount
  })

  if (!bookData || !clippingsData) {
    return <BookPageSkeleton />
  }

  return (
    <section className='page anna-fade-in'>
      <BookInfo
        book={bookData}
        uid={mappedMyData.data?.me.id ?? (~~domain)}
        duration={duration}
        isLastReadingBook={clippingsData.book.isLastReadingBook}
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

export default BookPageContent
