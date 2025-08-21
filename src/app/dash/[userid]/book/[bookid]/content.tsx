'use client'
import { useQuery } from '@apollo/client'
import { Masonry, useInfiniteLoader } from 'masonic'
import { useRef } from 'react'
import ClippingItem from '@/components/clipping-item/clipping-item'
import { usePageTrack } from '@/hooks/tracke'
import { useMasonaryColumnCount } from '@/hooks/use-screen-size'
import { BookDocument, type BookQuery, type Clipping } from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'
import type { WenquBook } from '@/services/wenqu'
import BookPageSkeleton from './skeleton'

type BookPageContentProps = {
  userid: string
  book: WenquBook
}

function BookPageContent(props: BookPageContentProps) {
  const { userid: domain, book: bookData } = props
  usePageTrack('book', {
    bookId: bookData.id,
  })

  const hasMore = useRef(true)
  const { data: clippingsData, fetchMore } = useQuery<BookQuery>(BookDocument, {
    variables: {
      id: bookData.doubanId,
      pagination: {
        limit: 10,
        offset: 0,
      },
    },
  })

  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader(
    (_, __, currentItems) => {
      if (!hasMore.current) {
        return Promise.reject(1)
      }
      return fetchMore({
        variables: {
          id: bookData.doubanId,
          pagination: {
            limit: 10,
            offset: currentItems.length,
          },
        },
      })
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      threshold: 3,
      totalItems: clippingsData?.book.clippingsCount,
    }
  )

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
