import { useQuery } from '@apollo/client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ClippingItem from '../../../../components/clipping-item/clipping-item'
import DashboardContainer from '../../../../components/dashboard-container/container'
import Divider from '../../../../components/divider/divider'
import MasonryContainer from '../../../../components/masonry-container'
import bookQuery from '../../../../schema/book.graphql'
import { book, bookVariables } from '../../../../schema/__generated__/book'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { TGlobalStore } from '../../../../store'

function UncheckedPage() {
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)

  const { data: clippingsData } = useQuery<book, bookVariables>(bookQuery, {
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
      <MasonryContainer>
        <React.Fragment>
          {clippingsData?.book.clippings.map(clipping => (
            <ClippingItem
              item={clipping}
              userid={uid}
              key={clipping.id}
              inAppChannel={IN_APP_CHANNEL.clippingFromUser}
            />
          ))}
        </React.Fragment>
      </MasonryContainer>
    </div>
  )
}

UncheckedPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default UncheckedPage
