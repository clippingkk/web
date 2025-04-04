import React from 'react'
import { metadata as pricingMetadata } from '../../components/og/og-with-pricing'
import PricingContent from './content'
import { Metadata } from 'next'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  ...pricingMetadata,
}

async function PricingPage() {
  const cs = await cookies()
  const uid = cs.get('uid')?.value
  return (
    <PricingContent uid={uid ? ~~uid : undefined} />
  )
}

export default PricingPage
