import Badge from '@annatarhe/lake-ui/badge'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { Crown } from 'lucide-react'
import type { Metadata } from 'next'

import AppStoreLink from '@/components/pricing/app-store-link'
import CheckoutButton from '@/components/pricing/checkout-button'
import {
  SettingsCard,
  SettingsSection,
} from '@/components/settings/settings-section'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { activeProvider, billingState } from '@/server/billing/state'
import { requireViewer } from '@/server/data/viewer'
import { formatDate } from '@/utils/format-date'

const STATUS_TONE: Record<
  string,
  'success' | 'warning' | 'neutral' | 'danger'
> = {
  active: 'success',
  trialing: 'success',
  past_due: 'warning',
  incomplete: 'warning',
  unpaid: 'danger',
  canceled: 'neutral',
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('orders.title') })
}

export default async function OrdersPage() {
  const [viewer, { t, i18n }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'settings'),
  ])
  const billing = await billingState(viewer.id)
  const subscriptions = billing.subscriptions
  const provider = activeProvider(billing)
  const hasStripe = subscriptions.some((s) => s.provider === 'stripe')

  return (
    <SettingsSection
      title={t('orders.title')}
      description={t('orders.description')}
      actions={
        provider === 'apple' ? (
          <AppStoreLink label={t('orders.appStore')} size="sm" />
        ) : hasStripe ? (
          <CheckoutButton signedIn portal />
        ) : undefined
      }
    >
      {subscriptions.length ? (
        <SettingsCard className="px-0 sm:px-0">
          <ul>
            {subscriptions.map((subscription) => {
              const statusKey = `orders.status.${subscription.status}`
              const status = i18n.exists(statusKey, { ns: 'settings' })
                ? t(statusKey)
                : subscription.status
              const date = formatDate(
                subscription.currentPeriodEnd,
                i18n.language,
                'long'
              )
              return (
                <li
                  key={subscription.id}
                  className="border-lake-line flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-b-0 sm:px-6"
                >
                  <span className="flex items-center gap-2.5">
                    <Crown
                      className="text-lake-warning size-4"
                      aria-hidden="true"
                    />
                    <span className="text-lake-fg font-medium">
                      {t('orders.premium')}
                    </span>
                    <span className="type-meta">
                      {t(`orders.provider.${subscription.provider}`)}
                    </span>
                    <Badge
                      tone={STATUS_TONE[subscription.status] ?? 'neutral'}
                      variant="soft"
                      size="sm"
                    >
                      {status}
                    </Badge>
                  </span>
                  {date ? (
                    <span className="type-meta">
                      {subscription.cancelAtPeriodEnd ||
                      subscription.status === 'canceled'
                        ? t('orders.ends', { date })
                        : t('orders.renews', { date })}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </SettingsCard>
      ) : (
        <EmptyState
          icon={<Crown className="size-6" />}
          title={t('orders.empty')}
          action={<CheckoutButton signedIn />}
        />
      )}
    </SettingsSection>
  )
}
