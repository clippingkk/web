'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ClippingItem from '../../../../components/clipping-item/clipping-item'
import Divider from '../../../../components/divider/divider'
import MasonryContainer from '../../../../components/masonry-container'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { TGlobalStore } from '../../../../store'
import { UserContent } from '../../../../store/user/type'
import { useBookQuery } from '../../../../schema/generated'

function UncheckedPageContent() {
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
      <Divider title={t('app.home.unchecked')} />
      <MasonryContainer>
        <>
          {clippingsData?.book.clippings.map(clipping => (
            <ClippingItem
              item={clipping}
              domain={domain}
              key={clipping.id}
              inAppChannel={IN_APP_CHANNEL.clippingFromUser}
            />
          ))}
        </>
      </MasonryContainer>
    </div>
  )
}

export default UncheckedPageContent
