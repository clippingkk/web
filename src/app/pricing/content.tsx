'use client'
import { Button } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FreePlanFeatures from '../../components/pricing/free-plan-features'
import PlanCard from '../../components/pricing/plan-card'
import PremiumPlanFeatures from '../../components/pricing/premium-plan-features'
import { StripePremiumPriceId } from '../../constants/config'
import { ProfileDocument, ProfileQuery, ProfileQueryVariables } from '../../schema/generated'
import { getPaymentSubscription } from '../../services/payment'
import { skipToken, useSuspenseQuery } from '@apollo/client'

type PricingContentProps = {
  uid?: number
}

function PricingContent(props: PricingContentProps) {
  const { uid } = props
  const { t } = useTranslation()

  const { data } = useQuery({
    queryKey: ['payment-subscription', StripePremiumPriceId],
    queryFn: () => getPaymentSubscription(StripePremiumPriceId),
    enabled: Boolean(uid && uid > 0),
  })

  const { data: p } = useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, uid && uid > 0 ? {
    variables: {
      id: uid
    }
  } : skipToken)

  const isPremium = useMemo(() => {
    const endAt = p?.me.premiumEndAt
    if (!endAt) {
      return false
    }

    return new Date(endAt).getTime() > new Date().getTime()
  }, [p?.me.premiumEndAt])
  return (
    <div className='w-full'>
      <div className='mt-32 mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 py-8'>
        <PlanCard
          title={t('app.plan.free.name')}
          description={t('app.plan.free.description')}
          plan='free'
          features={
            <FreePlanFeatures>
              <div className='w-full justify-center'>
                <Button
                  component={Link}
                  href={p ? `/dash/${p.me.id}/home` : '/auth/auth-v4'}
                  fullWidth
                  variant='gradient'
                  gradient={{ from: 'indigo', to: 'cyan' }}
                  size='lg'
                >
                  <span className=' py-8 text-2xl'>
                    {t('app.plan.free.goto')}
                  </span>
                </Button>
              </div>
            </FreePlanFeatures>
          }
        />
        <PlanCard
          title={(
            <h2 className='text-5xl font-bold text-transparent bg-clip-text dark:from-teal-200 dark:to-indigo-400 bg-linear-to-br from-teal-600 to-indigo-700'>{t('app.plan.premium.name')}</h2>
          )}
          plan='premium'
          description={t('app.plan.premium.description')}
          features={
            <PremiumPlanFeatures>
              <div className='w-full'>
                {isPremium ? (
                  <Link
                    href={`/dash/${p?.me.id}/home`}
                    className=' block py-4 rounded-md text-center bg-linear-to-br from-orange-500 to-sky-500 w-full hover:scale-105 transition-all duration-300'
                  >
                    {t('app.go')}
                  </Link>
                ) : (
                  <Link
                    href={data?.checkoutUrl ?? '/auth/auth-v4'}
                    className=' block py-4 rounded-md text-center bg-linear-to-br from-yellow-300 to-orange-500 w-full hover:scale-105 transition-all duration-300 shadow-lg'
                  >
                    {t('app.plan.premium.goto')}
                  </Link>
                )}
              </div>
            </PremiumPlanFeatures>
          }
        />
      </div>
    </div>
  )
}

export default PricingContent
