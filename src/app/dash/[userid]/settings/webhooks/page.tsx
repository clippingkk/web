import { buttonStyles } from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { ExternalLink, Webhook } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { SettingsSection } from '@/components/settings/settings-section'
import { FetchMyWebHooksDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { serverQuery } from '@/server/data/query'
import { requireViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

import CreateWebhook from './create-webhook'
import WebhookList from './webhook-list'

const DOCS_URL =
  'https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('webhooks.title') })
}

export default async function WebhooksPage() {
  const [viewer, { t }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'settings'),
  ])
  const data = await serverQuery(FetchMyWebHooksDocument, { id: viewer.id })
  const webhooks = data.me.webhooks

  return (
    <SettingsSection
      title={t('webhooks.title')}
      description={
        <>
          {t('webhooks.description')}{' '}
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-lake-accent-text inline-flex items-center gap-1 font-medium hover:underline"
          >
            {t('webhooks.docs')}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </>
      }
      actions={viewer.isPremium ? <CreateWebhook /> : undefined}
    >
      {!viewer.isPremium && webhooks.length === 0 ? (
        <EmptyState
          icon={<Webhook className="size-6" />}
          title={t('webhooks.premiumTitle')}
          description={t('webhooks.premiumDescription')}
          action={
            <Link
              href="/pricing"
              className={buttonStyles({ variant: 'primary', size: 'sm' })}
            >
              {t('webhooks.upgrade')}
            </Link>
          }
        />
      ) : webhooks.length === 0 ? (
        <EmptyState
          icon={<Webhook className="size-6" />}
          title={t('webhooks.emptyTitle')}
          description={t('webhooks.emptyDescription')}
        />
      ) : (
        <WebhookList
          webhooks={webhooks}
          basePath={dashHref(viewer, 'settings/webhooks')}
        />
      )}
    </SettingsSection>
  )
}
