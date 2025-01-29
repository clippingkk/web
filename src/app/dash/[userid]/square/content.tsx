'use client'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTrack } from '@/hooks/tracke'
import ClippingItem from '@/components/clipping-item/clipping-item'
import { useMultipleBook } from '@/hooks/book'
import { IN_APP_CHANNEL } from '@/services/channel'
import { APP_API_STEP_LIMIT } from '@/constants/config'
import { LoadMoreItemsCallback, Masonry, useInfiniteLoader } from 'masonic'
import { useMasonaryColumnCount } from '@/hooks/use-screen-size'
import { Divider } from '@mantine/core'
import { FetchSquareDataQuery, useFetchSquareDataQuery } from '@/schema/generated'

type SquarePageContentProps = {
  squareData: FetchSquareDataQuery
}

function SquarePageContent(props: SquarePageContentProps) {
  usePageTrack('square')
  const { t } = useTranslation()

  const masonaryColumnCount = useMasonaryColumnCount()

  const reachEnd = useRef(false)

  const [sqData, setSqData] = useState<FetchSquareDataQuery['featuredClippings']>(props.squareData.featuredClippings)
  const { data: localData, fetchMore } = useFetchSquareDataQuery({
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      }
    },
    skip: true
  })

  const data = localData ?? props.squareData
  // 这里会翻页，所以还是用客户端的书列表
  // ssr 的数据用来做 seo
  const books = useMultipleBook(data?.featuredClippings.map(x => x.bookID) || [])

  const maybeLoadMore = useInfiniteLoader<FetchSquareDataQuery['featuredClippings'][0], LoadMoreItemsCallback<FetchSquareDataQuery['featuredClippings'][0]>>(() => {
    if (sqData.length >= 200) {
      reachEnd.current = true
    }
    if (reachEnd.current) {
      return
    }
    return fetchMore({
      variables: {
        pagination: {
          limit: APP_API_STEP_LIMIT,
          lastId: sqData[sqData.length - 1].id,
        }
      }
    }).then(data => {
      if (data.data.featuredClippings.length === 0) {
        reachEnd.current = true
      }
      setSqData(
        prev => [
          ...prev,
          ...data.data.featuredClippings
        ]
          .reduce<FetchSquareDataQuery['featuredClippings']>((acc, x) => {
            if (!acc.find(y => y.id === x.id)) {
              acc.push(x)
            }
            return acc
          }, []))
    })
  }, {
    threshold: 3,
  })

  return (
    <section className='flex items-center justify-center flex-col'>
      <h2 className='text-3xl lg:text-5xl text-slate-900 dark:text-slate-100 my-8'>

        🪩 {t('app.menu.square')}
      </h2>
      <Divider className='w-full my-4' />
      <Masonry
        items={sqData}
        columnCount={masonaryColumnCount}
        className='with-slide-in'
        columnGutter={30}
        onRender={maybeLoadMore}
        render={(row) => {
          const clipping = row.data
          return (
            <ClippingItem
              key={clipping.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              item={clipping as any}
              domain={clipping.creator.domain.length > 2 ? clipping.creator.domain : clipping.creator.id.toString()}
              book={books.books.find(x => x.id.toString() == clipping.bookID)}
              creator={clipping.creator}
              inAppChannel={IN_APP_CHANNEL.clippingFromUser}
            />
          )
        }}
      />
    </section>
  )
}

export default SquarePageContent
