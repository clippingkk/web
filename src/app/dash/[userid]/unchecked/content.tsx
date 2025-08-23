'use client'
import ClippingItem from '@/components/clipping-item/clipping-item'
import Divider from '@/components/divider/divider'
import MasonryContainer from '@/components/masonry-container'
import { useQuery } from '@apollo/client/react'
import { BookDocument, type BookQuery } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { IN_APP_CHANNEL } from '@/services/channel'

type Props = {
  profile: { id: number; domain: string }
}

function UncheckedPageContent({ profile }: Props) {
  const domain =
    profile.domain.length > 2 ? profile.domain : profile.id.toString()
  const { data: clippingsData } = useQuery<BookQuery>(BookDocument, {
    variables: {
      id: 0,
      pagination: {
        limit: 50,
        offset: 0,
      },
    },
  })
  const { t } = useTranslation()

  return (
    <div>
      <Divider title={t('app.home.unchecked')} />
      <MasonryContainer>
        <>
          {clippingsData?.book.clippings.map((clipping) => (
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
