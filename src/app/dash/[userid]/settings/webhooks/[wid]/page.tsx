import EmptyState from '@annatarhe/lake-ui/empty-state'
import { Inbox } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SettingsSection } from '@/components/settings/settings-section'
import { FetchWebhookDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { serverQuery } from '@/server/data/query'
import { requireViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'
import { parseRouteId } from '@/utils/route-id'

import DeliveryList from './delivery-list'

type Props = {
  params: Promise<{ wid: string; userid: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('webhooks.detail.title') })
}

async function WebhookDetailPage(props: Props) {
  const { wid } = await props.params
  const id = parseRouteId(wid)
  if (id === null) notFound()
  const [viewer, { t }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'settings'),
  ])
  const data = await serverQuery(FetchWebhookDocument, { id })
  const webhook = data.webHook
  const deliveries = webhook.records.records

  return (
    <SettingsSection
      title={t('webhooks.detail.title')}
      description={t('webhooks.detail.description', { url: webhook.hookUrl })}
      actions={
        <Link
          href={dashHref(viewer, 'settings/webhooks')}
          className="text-lake-accent-text text-sm font-medium hover:underline"
        >
          {t('webhooks.detail.back')}
        </Link>
      }
    >
      <p className="type-meta">
        {t('webhooks.detail.count', { count: webhook.records.count })}
      </p>
      {deliveries.length ? (
        <DeliveryList deliveries={deliveries} />
      ) : (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title={t('webhooks.detail.empty')}
        />
      )}
    </SettingsSection>
  )
}

export default WebhookDetailPage
