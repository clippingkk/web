import Badge from '@annatarhe/lake-ui/badge'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { Crown } from 'lucide-react'
import type { Metadata } from 'next'

import CheckoutButton from '@/components/pricing/checkout-button'
import {
  SettingsCard,
  SettingsSection,
} from '@/components/settings/settings-section'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewer } from '@/server/data/viewer'
import { subjectBillingPath } from '@/server/gate/billing'
import { gateRequest } from '@/server/gate/client'
import { gateConfig } from '@/server/gate/config'
import { formatDate } from '@/utils/format-date'

type Subscription = {
  id: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd?: boolean
}

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
  const billing = await gateRequest<{ subscriptions: Subscription[] }>(
    `${await subjectBillingPath(viewer.id)}?environmentId=${gateConfig().environmentId}`
  )
  const subscriptions = billing.subscriptions

  return (
    <SettingsSection
      title={t('orders.title')}
      description={t('orders.description')}
      actions={
        subscriptions.length ? <CheckoutButton signedIn portal /> : undefined
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
