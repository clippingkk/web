import React from 'react'
import { metadata as pricingMetadata } from '../../components/og/og-with-pricing'
import PricingContent from './content'
import { Metadata } from 'next'

type PricingPageProps = {
}

export const metadata: Metadata = {
  ...pricingMetadata,
}

function PricingPage(props: PricingPageProps) {
  return (
    <PricingContent />
  )
}

export default PricingPage
