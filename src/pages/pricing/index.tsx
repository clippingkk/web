import { Button } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import Head from 'next/head'
import React from 'react'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'
import OGWithPricing from '../../components/og/og-with-pricing'
import { StripePremierPriceId } from '../../constants/config'
import { getPaymentSubscription } from '../../services/payment'

type PricingPageProps = {
}

function PricingPage(props: PricingPageProps) {
  const { data } = useQuery({
    queryKey: ['payment-subscription'],
    queryFn: () => getPaymentSubscription(StripePremierPriceId)
  })

  return (
    <div>
      <Button
      component='a'
      href={data?.checkoutUrl}
      >
        go Premier
      </Button>
    </div>
  )
}

PricingPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer header={<NavigateGuide title='Premier' />}>
      <Head>
        <title>ClippingKK - kindle 书摘管理</title>
        <OGWithPricing />
      </Head>
      {page}
    </DashboardContainer>
  )
}

export default PricingPage
