import { useQuery } from '@apollo/client'
import React, { useRef } from 'react'
import Head from 'next/head'
import { useTranslation } from 'react-i18next'
import { usePageTrack, useTitle } from '../../../../hooks/tracke'
import ClippingItem from '../../../../components/clipping-item/clipping-item'
import { duration3Days, useMultipBook } from '../../../../hooks/book'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { APP_API_STEP_LIMIT } from '../../../../constants/config'
import DashboardContainer from '../../../../components/dashboard-container/container'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { client, reactQueryClient } from '../../../../services/ajax'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../../services/wenqu'
import OGWithSquare from '../../../../components/og/og-with-square-page'
import { LoadMoreItemsCallback, Masonry, useInfiniteLoader } from 'masonic'
import { useMasonaryColumnCount } from '../../../../hooks/use-screen-size'
import { Divider } from '@mantine/core'
import { FetchSquareDataDocument, FetchSquareDataQuery, FetchSquareDataQueryVariables, useFetchSquareDataQuery } from '../../../../schema/generated'
import { dehydrate } from '@tanstack/react-query'

function SquarePage(serverResponse: InferGetServerSidePropsType<typeof getServerSideProps>) {
  usePageTrack('square')
  const { t } = useTranslation()
  useTitle(t('app.square.title') ?? '')

  const masonaryColumnCount = useMasonaryColumnCount()

  const reachEnd = useRef(false)

  const { data: localData, loading, fetchMore } = useFetchSquareDataQuery({
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      }
    },
    // skip: !!serverResponse.squareServerData
  })

  const data = localData ?? serverResponse.squareServerData
  // 这里会翻页，所以还是用客户端的书列表
  // ssr 的数据用来做 seo
  const books = useMultipBook(data?.featuredClippings.map(x => x.bookID) || [])

  const maybeLoadMore = useInfiniteLoader<FetchSquareDataQuery['featuredClippings'][0], LoadMoreItemsCallback<FetchSquareDataQuery['featuredClippings'][0]>>((startIndex, stopIndex, currentItems) => {
    if (currentItems.length >= 200) {
      reachEnd.current = true
    }
    if (reachEnd.current) {
      return
    }
    return fetchMore({
      variables: {
        pagination: {
          limit: APP_API_STEP_LIMIT,
          lastId: currentItems[currentItems.length - 1].id,
        }
      }
    })
  }, {
    threshold: 3,
  })

  return (
    <section className='flex items-center justify-center flex-col'>
      <Head>
        <title>square - clippingkk</title>
        <OGWithSquare books={books.books ?? []} />
      </Head>
      <h2 className='text-3xl lg:text-5xl dark:text-gray-400 my-8'> 🪩 Square</h2>
      <Divider className='w-full' />
      <Masonry
        items={(data.featuredClippings ?? [])}
        columnCount={masonaryColumnCount}
        className='with-slide-in'
        columnGutter={30}
        onRender={maybeLoadMore}
        render={(row) => {
          const clipping = row.data
          return (
            <ClippingItem
              key={clipping.id}
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

type serverSideProps = {
  squareServerData: FetchSquareDataQuery
}

export const getServerSideProps: GetServerSideProps<serverSideProps> = async (context) => {
  const squareResponse = await client.query<FetchSquareDataQuery, FetchSquareDataQueryVariables>({
    query: FetchSquareDataDocument,
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      }
    },
  })

  const dbIds = squareResponse.
    data.
    featuredClippings.
    map(x => x.bookID).
    filter(x => x.length > 3) ?? []

  if (dbIds.length >= 1) {
    await reactQueryClient.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
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
      squareServerData: squareResponse.data,
    }
  }
}

SquarePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default SquarePage
