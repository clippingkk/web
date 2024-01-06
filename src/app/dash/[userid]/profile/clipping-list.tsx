import React from 'react'
import { FetchClippingsByUidDocument, FetchClippingsByUidQuery, FetchClippingsByUidQueryVariables, useFetchClippingsByUidQuery } from '../../../../schema/generated'
import { Masonry, useInfiniteLoader } from 'masonic'
import { useMasonaryColumnCount } from '../../../../hooks/use-screen-size'
import ClippingItem from '../../../../components/clipping-item/clipping-item'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { useMultipBook } from '../../../../hooks/book'
import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'

type ClippingListProps = {
  uid: number
  userDomain: string
}

function ClippingList(props: ClippingListProps) {
  const { uid, userDomain } = props
  // const { data, loading, fetchMore } = useFetchClippingsByUidQuery({
  const { data, fetchMore } = useSuspenseQuery<FetchClippingsByUidQuery, FetchClippingsByUidQueryVariables>(FetchClippingsByUidDocument, {
    variables: {
      uid,
      pagination: {
        limit: 20,
      }
    },
    // onCompleted(data) {
    //   setRenderList(data.clippingList.items)
    // },
  })
  const [renderList, setRenderList] = React.useState<FetchClippingsByUidQuery['clippingList']['items']>(data.clippingList.items)

  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader((startIndex, stopIndex, currentItems: FetchClippingsByUidQuery['clippingList']['items']) => {
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
          lastId: currentItems[currentItems.length - 1].id
        }
      },
    }).then((resp) => {
      setRenderList(prev => [...prev, ...resp.data.clippingList.items].reduce((acc, cur) => {
        if (!acc.find(x => x.id === cur.id)) {
          acc.push(cur)
        }
        return acc
      }, [] as FetchClippingsByUidQuery['clippingList']['items']))
    })
  }, {
    isItemLoaded: (index, items) => !!items[index],
    threshold: 3,
    totalItems: data?.clippingList.count ?? 0
  })

  const books = useMultipBook(data?.clippingList.items.map(x => x.bookID) ?? [])

  if (!data) {
    // TODO: add no data component
    return (
      <div>
        no data
      </div>
    )
  }

  return (
    <Masonry
      items={renderList}
      columnCount={masonaryColumnCount}
      columnGutter={30}
      onRender={maybeLoadMore}
      itemKey={(x) => x.id}
      render={(row) => {
        const clipping = row.data
        return (
          <ClippingItem
            item={clipping}
            domain={userDomain || uid.toString()}
            book={books.books.find(x => x.doubanId.toString() === clipping.bookID)}
            creator={clipping.creator}
            key={clipping.id}
            inAppChannel={IN_APP_CHANNEL.clippingFromBook}
          />
        )
      }}
    />
  )
}

export default ClippingList
