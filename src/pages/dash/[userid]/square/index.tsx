import { useQuery } from '@apollo/client'
import React from 'react'
import Head from 'next/head'
import { useTranslation } from 'react-i18next'
import fetchSquareDataQuery from '../../../../schema/square.graphql'
import { usePageTrack, useTitle } from '../../../../hooks/tracke'
import { fetchSquareData, fetchSquareDataVariables, fetchSquareData_featuredClippings } from '../../../../schema/__generated__/fetchSquareData'
import ClippingItem from '../../../../components/clipping-item/clipping-item'
import { useMultipBook } from '../../../../hooks/book'
import MasonryContainer from '../../../../components/masonry-container'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import ListFooter from '../../../../components/list-footer/list-footer'
import { useState } from 'react'
import { APP_API_STEP_LIMIT } from '../../../../constants/config'
import DashboardContainer from '../../../../components/dashboard-container/container'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { client } from '../../../../services/ajax'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../../services/wenqu'
import OGWithSquare from '../../../../components/og/og-with-square-page'
import { fetchClipping_clipping } from '../../../../schema/__generated__/fetchClipping'

// function DevelopingAlert() {
//   const { t } = useTranslation()
//   return (
//     <div className='my-12 rounded-sm text-6xl font-light shadow-2xl p-8 flex flex-col justify-center items-center dark:text-gray-300'>
//       <span>🤦‍♂️ </span>
//       <span>{t('app.common.closed')}</span>
//     </div>
//   )
// }

function SquarePage(serverResponse: InferGetServerSidePropsType<typeof getServerSideProps>) {
  usePageTrack('square')
  const { t } = useTranslation()
  useTitle(t('app.square.title'))

  const [reachEnd, setReachEnd] = useState(false)

  const { data: localData, loading, fetchMore, called } = useQuery<fetchSquareData, fetchSquareDataVariables>(fetchSquareDataQuery, {
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

  return (
    <section className='flex items-center justify-center flex-col'>
      <Head>
        <title>square - clippingkk</title>
        <OGWithSquare books={serverResponse.books} />
      </Head>
      <h2 className='text-3xl lg:text-5xl dark:text-gray-400 my-8'>Square</h2>
      <MasonryContainer>
        <React.Fragment>
          {data?.featuredClippings.map(clipping => (
            <ClippingItem
              item={clipping as any}
              domain={clipping.creator.domain.length > 2 ? clipping.creator.domain : clipping.creator.id.toString()}
              book={books.books.find(x => x.id.toString() == clipping.bookID)}
              key={clipping.id}
              creator={clipping.creator}
              inAppChannel={IN_APP_CHANNEL.clippingFromUser}
            />
          ))}
        </React.Fragment>
      </MasonryContainer>
      <ListFooter
        loadMoreFn={() => {
          if (loading || !called || !fetchMore) {
            return
          }
          fetchMore({
            variables: {
              pagination: {
                limit: APP_API_STEP_LIMIT,
                lastId: data?.featuredClippings[data.featuredClippings.length - 1].id,
              }
            },
            updateQuery(prev, { fetchMoreResult }) {
              if (!fetchMoreResult || fetchMoreResult.featuredClippings.length === 0) {
                setReachEnd(true)
                return prev
              }

              const resultDataList = [
                ...(prev.featuredClippings ?? []),
                ...fetchMoreResult.featuredClippings
              ].reduce((acc, cur) => {
                if (acc.findIndex(x => x.id === cur.id) === -1) {
                  acc.push(cur)
                }
                return acc
              }, [] as fetchSquareData_featuredClippings[])

              return {
                ...prev,
                featuredClippings: resultDataList
              }
            }
          })
        }}
        hasMore={!reachEnd}
      />
    </section>
  )
}

type serverSideProps = {
  squareServerData: fetchSquareData
  books: WenquBook[]
}

export const getServerSideProps: GetServerSideProps<serverSideProps> = async (context) => {
  const squareResponse = await client.query<fetchSquareData, fetchSquareDataVariables>({
    query: fetchSquareDataQuery,
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

  let booksServerData: WenquBook[] = []

  if (dbIds.length >= 1) {
    const query = dbIds.join('&dbIds=')
    const books = await wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${query}`)
    booksServerData.push(...books.books)
  }

  return {
    props: {
      squareServerData: squareResponse.data,
      books: booksServerData
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
