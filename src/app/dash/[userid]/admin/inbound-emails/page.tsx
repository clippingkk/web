import { buttonStyles } from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { Inbox } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import InboundEmailList from '@/components/settings/inbound-email-list'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewerRoute } from '@/server/data/path-user'
import { listUnverifiedInboundEmails } from '@/server/email-import/records'
import { dashHref } from '@/utils/profile.utils'

import AdminNav from '../admin-nav'

const PAGE_SIZE = 50

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ offset?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('admin.inbound.meta.title') })
}

/** Mail the import address got from senders no reader has verified. */
async function AdminInboundEmailsPage(props: PageProps) {
  const [{ userid }, { offset: rawOffset }] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const viewer = await requireViewerRoute(userid, 'admin/inbound-emails')
  // Non-admins learn nothing about this page existing.
  if (!viewer.isAdmin) notFound()
  const offset = Math.max(0, Number.parseInt(rawOffset ?? '0', 10) || 0)
  const [emails, { t }] = await Promise.all([
    listUnverifiedInboundEmails({ limit: PAGE_SIZE, offset }),
    getTranslation(undefined, 'settings'),
  ])
  const base = dashHref(viewer, 'admin/inbound-emails')
  const pageLink = (next: number) => `${base}?offset=${next}` as Route

  return (
    <Page width="default">
      <PageHeader
        eyebrow={t('admin.eyebrow')}
        title={t('admin.inbound.title')}
        description={t('admin.inbound.description')}
      />
      <AdminNav slug={viewer.slug} active="inbound" />
      {emails.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title={t('admin.inbound.empty')}
        />
      ) : (
        <InboundEmailList emails={emails} audience="admin" />
      )}
      <nav className="flex justify-between">
        {offset > 0 ? (
          <Link
            href={pageLink(Math.max(0, offset - PAGE_SIZE))}
            className={buttonStyles({ variant: 'ghost', size: 'sm' })}
          >
            ←
          </Link>
        ) : (
          <span />
        )}
        {emails.length === PAGE_SIZE ? (
          <Link
            href={pageLink(offset + PAGE_SIZE)}
            className={buttonStyles({ variant: 'ghost', size: 'sm' })}
          >
            →
          </Link>
        ) : null}
      </nav>
    </Page>
  )
}

export default AdminInboundEmailsPage
