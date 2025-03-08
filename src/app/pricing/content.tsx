'use client'
import { Button, Text, Container, Divider } from '@mantine/core'
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
import { Sparkles, Book, ChevronRight } from 'lucide-react'

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
    <div className='w-full relative'>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/2 right-1/4 w-64 h-64 bg-cyan-600/20 rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <Container size="lg" className="py-12 px-4">
        {/* Header section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 mb-4">
            <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">{t('app.pricing.unlock')}</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            {t('app.pricing.title')}
          </h2>

          <p className=" w-full text-xl opacity-80 max-w-3xl mx-auto">
            {t('app.pricing.subtitle')}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto relative">
          {/* Decorative arrow */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <ChevronRight className="h-12 w-12 text-indigo-500/50" />
          </div>

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
                    className="py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]"
                  >
                    <span className="text-xl font-medium">
                      {t('app.plan.free.goto')}
                    </span>
                  </Button>
                </div>
              </FreePlanFeatures>
            }
          />

          <PlanCard
            title={
              <h2 className='text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-fuchsia-500'>
                {t('app.plan.premium.name')}
              </h2>
            }
            plan='premium'
            description={t('app.plan.premium.description')}
            features={
              <PremiumPlanFeatures>
                <div className='w-full'>
                  {isPremium ? (
                    <Link
                      href={`/dash/${p?.me.id}/home`}
                      className="inline-flex items-center justify-center w-full py-4 px-6 rounded-xl text-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
                    >
                      <Book className="w-5 h-5 mr-2" />
                      {t('app.go')}
                    </Link>
                  ) : (
                    <Link
                      href={data?.checkoutUrl ?? '/auth/auth-v4'}
                      className="inline-flex items-center justify-center w-full py-4 px-6 rounded-xl text-center bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:from-fuchsia-600 hover:to-indigo-700 text-white font-medium text-lg hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('app.plan.premium.goto')}
                    </Link>
                  )}
                </div>
              </PremiumPlanFeatures>
            }
          />
        </div>

        {/* FAQ or testimonials section could go here */}
        <div className="mt-24 text-center">
          <Divider className="max-w-md mx-auto mb-10" />
          <Text className="text-lg opacity-70">
            {t('app.pricing.questions')}
            <a href="mailto:support@clippingkk.org" className="text-indigo-400 hover:text-indigo-500 ml-1 underline">
              support@clippingkk.org
            </a>
          </Text>
        </div>
      </Container>
    </div>
  )
}

export default PricingContent
