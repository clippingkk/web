import { useQuery } from '@apollo/client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import fetchSquareDataQuery from '../../schema/square.graphql'
import { usePageTrack, useTitle } from '../../hooks/tracke'
import { fetchSquareData, fetchSquareDataVariables } from '../../schema/__generated__/fetchSquareData'
import { propTypes } from 'qrcode.react'
import ClippingItem from '../../components/clipping-item/clipping-item'
import { useMultipBook } from '../../hooks/book'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '../../store'
import { UserContent } from '../../store/user/type'

function DevelopingAlert() {
  const { t } = useTranslation()
  return (
    <div className='my-12 rounded-sm text-6xl font-light shadow-2xl p-8 flex flex-col justify-center items-center dark:text-gray-300'>
      <span>🤦‍♂️ </span>
      <span>{t('app.common.closed')}</span>
    </div>
  )
}

function SquarePage() {
  usePageTrack('square')
  const { t } = useTranslation()
  useTitle(t('app.square.title'))

  const { data, loading } = useQuery<fetchSquareData, fetchSquareDataVariables>(fetchSquareDataQuery, {
    variables: {
      pagination: {
        limit: 20,
      }
    }
  })

  const books = useMultipBook(data?.featuredClippings.map(x => x.bookID) || [])

  return (
    <section className='flex items-center justify-center flex-col'>
      <h2 className='text-3xl lg:text-5xl dark:text-gray-400 my-8'>Square</h2>
      <div className='masonry-1 lg:masonry-2 xl:masonry-3 2xl:masonry-4 masonry-gap-4 mb-16'>
        {data?.featuredClippings.map(clipping => (
          <ClippingItem
            item={clipping as any}
            userid={clipping.creator.id}
            book={books.books.find(x => x.id.toString() == clipping.bookID)}
            key={clipping.id}
            creator={clipping.creator}
          />
        ))}
      </div>
    </section>
  )
}

export default SquarePage
