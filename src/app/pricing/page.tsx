import type { Metadata } from 'next'

import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'
import { listPlans } from '@/server/gate/billing'
import { gateConfig } from '@/server/gate/config'
import { currentUserId } from '@/server/gate/current'
import { doApolloServerQuery } from '@/services/apollo.server'

import { metadata as pricingMetadata } from '../../components/og/og-with-pricing'
import PricingContent from './content'

export const metadata: Metadata = {
  ...pricingMetadata,
}

async function PricingPage() {
  const uid = (await currentUserId())?.toString()

  const plans = gateConfig().apiKey ? await listPlans() : []
  const premiumAvailable = plans.some(
    (plan) => plan.key === 'premium' && plan.active
  )
  let profile: ProfileQuery['me'] | null = null
  if (uid) {
    const profileResponse = await doApolloServerQuery<
      ProfileQuery,
      ProfileQueryVariables
    >({
      query: ProfileDocument,
      variables: {
        id: ~~uid,
      },
      context: {
        headers: {},
      },
    })
    profile = profileResponse.data!.me
  }

  return (
    <PricingContent profile={profile} premiumAvailable={premiumAvailable} />
  )
}

export default PricingPage
