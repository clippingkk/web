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
import { uniqueById } from '@/utils/array'

type ClippingListProps = {
  uid: number
  userDomain: string
  initialClippings?: FetchClippingsByUidQuery['clippingList']
}

function ClippingList(props: ClippingListProps) {
  const { uid, userDomain, initialClippings } = props
  const hasInitial = !!initialClippings
  const [extraItems, setExtraItems] = React.useState<
    FetchClippingsByUidQuery['clippingList']['items']
  >(initialClippings?.items ?? [])
  const { data, loading, fetchMore } = useFetchClippingsByUidQuery({
    variables: {
      uid,
      pagination: {
        limit: 20,
      },
    },
    skip: hasInitial,
  })
  const totalCount = data?.clippingList.count ?? initialClippings?.count ?? 0
  const renderList = React.useMemo(() => {
    const initial = data?.clippingList.items ?? []
    return uniqueById([...initial, ...extraItems])
  }, [data, extraItems])
  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader(
    (
      _,
      __,
      currentItems: FetchClippingsByUidQuery['clippingList']['items']
    ) => {
      if (renderList.length === 0) {
        return
      }
      if (currentItems.length >= totalCount) {
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
        setExtraItems((prev) => [...prev, ...resp.data!.clippingList.items])
      })
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      threshold: 3,
      totalItems: totalCount,
    }
  )

  const books = useMultipleBook(renderList.map((x) => x.bookID))

  if (loading && !data && !hasInitial) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {new Array(9).fill(0).map((_, index) => (
          <div
            key={index}
            className="relative h-52 w-full animate-pulse overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60"
          >
            <span
              aria-hidden
              className="absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-blue-300/40 to-transparent dark:from-blue-400/40"
            />
            <div className="space-y-3">
              <div className="h-4 w-2/3 rounded-md bg-gray-200 dark:bg-zinc-700"></div>
              <div className="h-3 w-full rounded-md bg-gray-200 dark:bg-zinc-700"></div>
              <div className="h-3 w-4/5 rounded-md bg-gray-200 dark:bg-zinc-700"></div>
              <div className="h-3 w-3/5 rounded-md bg-gray-200 dark:bg-zinc-700"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="transition-all duration-300">
      {renderList.length === 0 && !loading ? (
        <div className="py-12 text-center">
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
