import { useQuery } from '@apollo/client'
import React from 'react'
import Head from 'next/head'
import { useTranslation } from 'react-i18next'
import fetchSquareDataQuery from '../../../../schema/square.graphql'
import { usePageTrack, useTitle } from '../../../../hooks/tracke'
import { fetchSquareData, fetchSquareDataVariables } from '../../../../schema/__generated__/fetchSquareData'
import ClippingItem from '../../../../components/clipping-item/clipping-item'
import { useMultipBook } from '../../../../hooks/book'
import MasonryContainer from '../../../../components/masonry-container'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import ListFooter from '../../../../components/list-footer/list-footer'
import { useState } from 'react'
import { APP_API_STEP_LIMIT } from '../../../../constants/config'
import DashboardContainer from '../../../../components/dashboard-container/container'

// function DevelopingAlert() {
//   const { t } = useTranslation()
//   return (
//     <div className='my-12 rounded-sm text-6xl font-light shadow-2xl p-8 flex flex-col justify-center items-center dark:text-gray-300'>
//       <span>🤦‍♂️ </span>
//       <span>{t('app.common.closed')}</span>
//     </div>
//   )
// }

function SquarePage() {
  usePageTrack('square')
  const { t } = useTranslation()
  useTitle(t('app.square.title'))

  const [reachEnd, setReachEnd] = useState(false)

  const { data, loading, fetchMore, called } = useQuery<fetchSquareData, fetchSquareDataVariables>(fetchSquareDataQuery, {
    variables: {
      pagination: {
        limit: APP_API_STEP_LIMIT,
      }
    }
  })

  const books = useMultipBook(data?.featuredClippings.map(x => x.bookID) || [])

  return (
    <section className='flex items-center justify-center flex-col'>
      <Head>
        <title>square</title>
        </Head>
      <h2 className='text-3xl lg:text-5xl dark:text-gray-400 my-8'>Square</h2>
      <MasonryContainer>
        <React.Fragment>
          {data?.featuredClippings.map(clipping => (
            <ClippingItem
              item={clipping as any}
              userid={clipping.creator.id}
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
          if (loading || !called) {
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
              return {
                ...prev,
                featuredClippings: [...prev.featuredClippings, ...fetchMoreResult.featuredClippings]
              }
            }
          })
        }}
        hasMore={!reachEnd}
      />
    </section>
  )
}

SquarePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default SquarePage
