import Badge from '@annatarhe/lake-ui/badge'
import Button from '@annatarhe/lake-ui/button'
import Link from 'next/link'
import type React from 'react'

import Page from '@/components/layout/page'
import AppStoreLink from '@/components/pricing/app-store-link'
import CheckoutButton from '@/components/pricing/checkout-button'
import PlanCard from '@/components/pricing/plan-card'
import { SUPPORT_EMAIL } from '@/constants/config'
import { getTranslation } from '@/i18n'
import { authHref } from '@/lib/auth-href'
import { withLink } from '@/lib/with-link'
import type { BillingProvider } from '@/server/billing/state'
import type { Viewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

const FREE_FEATURES = [
  'freeStorage',
  'freeAi',
  'books',
  'web',
  'widget',
  'privacy',
  'support',
] as const

const PREMIUM_FEATURES = [
  'premiumStorage',
  'premiumAi',
  'books',
  'web',
  'widget',
  'privacy',
  'rss',
  'webhooks',
  'cli',
  'prioritySupport',
] as const

type PricingContentProps = {
  viewer: Viewer | null
  /** Whether Gate has an active `premium` plan to check out. */
  premiumAvailable: boolean
  /** Who bills a Premium reader; null for Free readers and manual grants. */
  provider: BillingProvider | null
}

async function PricingContent({
  viewer,
  premiumAvailable,
  provider,
}: PricingContentProps) {
  const { t } = await getTranslation(undefined, 'pricing')
  const isPremium = viewer?.isPremium ?? false

  const currentBadge = (
    <Badge tone="accent" variant="soft" size="sm">
      {t('badge.current')}
    </Badge>
  )

  const freeAction = viewer ? (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      render={<Link href={dashHref(viewer, 'home')} />}
    >
      {t('plan.free.open')}
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      render={<Link href={authHref('/pricing')} />}
    >
      {t('plan.free.start')}
    </Button>
  )

  let premiumAction: React.ReactNode
  if (isPremium) {
    premiumAction = (
      <>
        <p className="text-lake-success text-sm">{t('plan.premium.active')}</p>
        {provider === 'apple' ? (
          <>
            <p className="type-meta">{t('plan.premium.appStore')}</p>
            <AppStoreLink label={t('checkout.appStore')} size="lg" fullWidth />
          </>
        ) : provider === 'stripe' ? (
          <CheckoutButton signedIn portal size="lg" fullWidth />
        ) : null}
      </>
    )
  } else if (premiumAvailable) {
    premiumAction = <CheckoutButton signedIn={!!viewer} size="lg" fullWidth />
  } else {
    premiumAction = (
      <p className="rounded-lake-control bg-lake-surface-muted text-lake-fg-muted px-4 py-3 text-sm">
        {t('plan.premium.unavailable')}
      </p>
    )
  }

  return (
    <Page width="default" className="gap-14 md:py-20">
      <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="type-eyebrow">{t('eyebrow')}</p>
        <h1 className="type-display text-lake-fg">{t('title')}</h1>
        <p className="text-lake-fg-muted text-lg leading-relaxed">
          {t('subtitle')}
        </p>
      </header>

      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <PlanCard
          id="plan-free"
          name={t('plan.free.name')}
          description={t('plan.free.description')}
          price={t('plan.free.price')}
          badge={viewer && !isPremium ? currentBadge : null}
          featuresLabel={t('features.label')}
          features={FREE_FEATURES.map((key) => t(`features.${key}`))}
          action={freeAction}
        />
        <PlanCard
          id="plan-premium"
          emphasis
          name={t('plan.premium.name')}
          description={t('plan.premium.description')}
          price={t('plan.premium.price')}
          badge={
            isPremium ? (
              currentBadge
            ) : (
              <Badge tone="accent" variant="outline" size="sm">
                {t('badge.recommended')}
              </Badge>
            )
          }
          featuresLabel={t('features.label')}
          features={PREMIUM_FEATURES.map((key) => t(`features.${key}`))}
          action={premiumAction}
        />
      </div>

      <section
        aria-labelledby="pricing-help"
        className="border-lake-line mx-auto flex max-w-2xl flex-col items-center gap-2 border-t pt-10 text-center"
      >
        <h2 id="pricing-help" className="type-heading text-lake-fg">
          {t('help.title')}
        </h2>
        <p className="type-body text-lake-fg-muted">
          {withLink(t('help.body', { email: SUPPORT_EMAIL }), (label) => (
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-lake-accent-text decoration-lake-accent-text/40 focus-visible:ring-lake-ring rounded-sm font-medium underline underline-offset-4 transition-colors duration-150 outline-none hover:decoration-current focus-visible:ring-2"
            >
              {label}
            </a>
          ))}
        </p>
        <p className="type-meta">{t('help.secure')}</p>
      </section>
    </Page>
  )
}

export default PricingContent
