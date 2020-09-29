import { useQuery } from '@apollo/client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ClippingItem from '../../components/clipping-item/clipping-item'
import Divider from '../../components/divider/divider'
import bookQuery from '../../schema/book.graphql'
import { book, bookVariables } from '../../schema/__generated__/book'
import { TGlobalStore } from '../../store'

type UncheckedPageProps = {
}

function UncheckedPage(props: UncheckedPageProps) {
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)

  const { data: clippingsData, fetchMore, loading } = useQuery<book, bookVariables>(bookQuery, {
    variables: {
      id: 0,
      pagination: {
        limit: 50,
        offset: 0
      }
    },
  })
  const { t } = useTranslation()

  return (
    <div>
      <Divider title={t('app.home.unchecked')} />
      <div className='flex flex-wrap justify-center'>
        {clippingsData?.book.clippings.map(clipping => (
          <ClippingItem
            item={clipping}
            userid={uid}
            key={clipping.id}
          />
        ))}
      </div>
    </div>
  )
}

export default UncheckedPage
