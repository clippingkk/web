'use client'
import { Masonry, useInfiniteLoader } from 'masonic'
import React from 'react'
import ClippingItem from '@/components/clipping-item/clipping-item'
import { useMultipleBook } from '@/hooks/book'
import { useMasonaryColumnCount } from '@/hooks/use-screen-size'
import {
  type FetchClippingsByUidQuery,
  useFetchClippingsByUidQuery,
} from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'

type ClippingListProps = {
  uid: number
  userDomain: string
}

function ClippingList(props: ClippingListProps) {
  const { uid, userDomain } = props
  const [renderList, setRenderList] = React.useState<
    FetchClippingsByUidQuery['clippingList']['items']
  >([])
  const { data, loading, fetchMore } = useFetchClippingsByUidQuery({
    variables: {
      uid,
      pagination: {
        limit: 20,
      },
    },
    onCompleted(data) {
      setRenderList(data.clippingList.items)
    },
  })
  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader(
    (
      _,
      __,
      currentItems: FetchClippingsByUidQuery['clippingList']['items']
    ) => {
      if (renderList.length === 0 || !data) {
        return
      }
      if (currentItems.length >= data.clippingList.count) {
        return Promise.reject(1)
      }
      return fetchMore({
        variables: {
          uid,
          pagination: {
            limit: 10,
            lastId: currentItems[currentItems.length - 1].id,
          },
        },
      }).then((resp) => {
        setRenderList((prev) =>
          [...prev, ...resp.data.clippingList.items].reduce(
            (acc, cur) => {
              if (!acc.find((x) => x.id === cur.id)) {
                acc.push(cur)
              }
              return acc
            },
            [] as FetchClippingsByUidQuery['clippingList']['items']
          )
        )
      })
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      threshold: 3,
      totalItems: data?.clippingList.count ?? 0,
    }
  )

  const books = useMultipleBook(
    data?.clippingList.items.map((x) => x.bookID) ?? []
  )

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {new Array(9).fill(0).map((_, index) => (
          <div
            key={index}
            className="w-full h-52 rounded-xl animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden shadow-md"
          >
            <div className="h-1/3 w-full bg-gray-300 dark:bg-gray-600 opacity-50"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
              <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded-md"></div>
              <div className="h-3 w-4/5 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="transition-all duration-300">
      {renderList.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No clippings found</p>
        </div>
      ) : (
        <Masonry
          items={renderList}
          columnCount={masonaryColumnCount}
          columnGutter={3}
          onRender={maybeLoadMore}
          itemKey={(x) => x.id}
          render={(row) => {
            const clipping = row.data
            return (
              <ClippingItem
                item={clipping}
                domain={userDomain || uid.toString()}
                book={books.books.find(
                  (x) => x.doubanId.toString() === clipping.bookID
                )}
                creator={clipping.creator}
                key={clipping.id}
                inAppChannel={IN_APP_CHANNEL.clippingFromBook}
              />
            )
          }}
        />
      )}
    </div>
  )
}

export default ClippingList
