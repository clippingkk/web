'use client'
import React, { useEffect, useRef } from 'react'
import ClippingItem from '@/components/clipping-item/clipping-item'
import { changeBackground } from '@/store/app/type'
import { useDispatch } from 'react-redux'
import { usePageTrack } from '@/hooks/tracke'
import { IN_APP_CHANNEL } from '@/services/channel'
import { useMasonaryColumnCount } from '@/hooks/use-screen-size'
import { Masonry, useInfiniteLoader } from 'masonic'
import { BookDocument, BookQuery, Clipping } from '@/schema/generated'
import BookPageSkeleton from './skeleton'
import { useQuery } from '@apollo/client'
import { WenquBook } from '@/services/wenqu'

type BookPageContentProps = {
  userid: string
  book: WenquBook
}

function BookPageContent(props: BookPageContentProps) {
  const { userid: domain, book: bookData } = props
  usePageTrack('book', {
    bookId: bookData.id
  })
  const dispatch = useDispatch()

  const hasMore = useRef(true)
  const { data: clippingsData, fetchMore } = useQuery<BookQuery>(BookDocument, {
    variables: {
      id: bookData.doubanId,
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

  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader((_, __, currentItems) => {
    if (!hasMore.current) {
      return Promise.reject(1)
    }
    return fetchMore({
      variables: {
        id: bookData.doubanId,
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
  )
}

export default BookPageContent
