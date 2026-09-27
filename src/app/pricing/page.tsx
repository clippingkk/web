import type { Metadata } from 'next'
import { unstable_rethrow } from 'next/navigation'
import { connection } from 'next/server'

import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { getViewer } from '@/server/data/viewer'
import { listPlans } from '@/server/gate/billing'
import { gateConfig } from '@/server/gate/config'

import PricingContent from './content'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'pricing')
  return pageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/pricing',
  })
}

/** A Gate outage shows "purchases are paused" instead of failing the page. */
async function isPremiumAvailable() {
  // Plans are live data, and Gate config needs the server env, which a build
  // doesn't have: never prerender this.
  await connection()
  if (!gateConfig().apiKey) return false
  try {
    const plans = await listPlans()
    return plans.some((plan) => plan.key === 'premium' && plan.active)
  } catch (error) {
    unstable_rethrow(error)
    console.error('pricing: could not list Gate plans', error)
    return false
  }
}

async function PricingPage() {
  const [viewer, premiumAvailable] = await Promise.all([
    getViewer(),
    isPremiumAvailable(),
  ])
  return <PricingContent viewer={viewer} premiumAvailable={premiumAvailable} />
}

export default PricingPage
