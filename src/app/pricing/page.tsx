import React from 'react'
import { metadata as pricingMetadata } from '../../components/og/og-with-pricing'
import PricingContent from './content'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { StripePremiumPriceId } from '@/constants/config'
import { getPaymentSubscription } from '@/services/payment'
import { doApolloServerQuery } from '@/services/apollo.server'
import { ProfileDocument, ProfileQuery, ProfileQueryVariables } from '@/schema/generated'
import { USER_ID_KEY, COOKIE_TOKEN_KEY } from '@/constants/storage'

export const metadata: Metadata = {
  ...pricingMetadata,
}

async function PricingPage() {
  const cs = await cookies()
  const uid = cs.get(USER_ID_KEY)?.value
  const tk = cs.get(COOKIE_TOKEN_KEY)?.value

  let checkoutUrl = ''
  let profile: ProfileQuery['me'] | null = null
  if (uid && tk) {
    const paymentSubscription = await getPaymentSubscription(StripePremiumPriceId, {
      headers: {
        'Authorization': 'Bearer ' + tk,
      },
    })
    checkoutUrl = paymentSubscription.checkoutUrl

    const profileResponse = await doApolloServerQuery<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      variables: {
        id: ~~uid
      },
      context: {
        headers: {
          'Authorization': 'Bearer ' + tk,
        },
      }
    })
    profile = profileResponse.data.me
  }

  return (
    <PricingContent profile={profile} checkoutUrl={checkoutUrl} />
  )
}

export default PricingPage
