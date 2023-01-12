import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Head from 'next/head'
import ClippingItem from '../../../../components/clipping-item/clipping-item'
import DashboardContainer from '../../../../components/dashboard-container/container'
import Divider from '../../../../components/divider/divider'
import MasonryContainer from '../../../../components/masonry-container'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { TGlobalStore } from '../../../../store'
import { UserContent } from '../../../../store/user/type'
import { useBookQuery } from '../../../../schema/generated'

function UncheckedPage() {
  const profile = useSelector<TGlobalStore, UserContent>(s => s.user.profile)

  const domain = profile.domain.length > 2 ? profile.domain : profile.id.toString()
  const { data: clippingsData } = useBookQuery({
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
      <Head>
        <title>unchecked books</title>
        </Head>
      <Divider title={t('app.home.unchecked')} />
      <MasonryContainer>
        <React.Fragment>
          {clippingsData?.book.clippings.map(clipping => (
            <ClippingItem
              item={clipping}
              domain={domain}
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
