import { Button, Divider } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'
import OGWithPricing from '../../components/og/og-with-pricing'
import FreePlanFeatures from '../../components/pricing/free-plan-features'
import PlanCard from '../../components/pricing/plan-card'
import PremiumPlanFeatures from '../../components/pricing/premium-plan-features'
import { StripePremiumPriceId } from '../../constants/config'
import { getPaymentSubscription } from '../../services/payment'

type PricingPageProps = {
}

function PricingPage(props: PricingPageProps) {
  const { data } = useQuery({
    queryKey: ['payment-subscription', StripePremiumPriceId],
    queryFn: () => getPaymentSubscription(StripePremiumPriceId)
  })

  return (
    <div className='w-full'>
      <div className='mt-32 mx-auto w-full grid grid-cols-2 gap-8'>
        <PlanCard
          title='Free Plan'
          description='Good for everyone'
          features={
            <FreePlanFeatures>
              <div className='w-full justify-center'>
                <Button
                  component={Link}
                  href='/auth/auth-v3'
                  className=' bg-gradient-to-br from-orange-600 to-sky-700 w-full'
                >
                  <span className=' py-8 text-2xl'>
                    Login
                  </span>
                </Button>
              </div>
            </FreePlanFeatures>
          }
        />
        <PlanCard
          title={(
            <h2 className='text-5xl'>Premium</h2>
          )}
          description='Aim for highest'
          features={
            <PremiumPlanFeatures>
              <div className='w-full'>
                <Link
                  href={data?.checkoutUrl ?? '/'}
                  className=' block py-4 rounded-md text-center bg-gradient-to-br from-orange-600 to-sky-700 w-full hover:scale-105 transition-all duration-300'
                >
                  Upgrade to Premium
                </Link>
              </div>
            </PremiumPlanFeatures>
          }
        />
      </div>
    </div>
  )
}

PricingPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer header={<NavigateGuide title='Premium' />}>
      <Head>
        <title>ClippingKK - kindle 书摘管理</title>
        <OGWithPricing />
      </Head>
      {page}
    </DashboardContainer>
  )
}

export default PricingPage
