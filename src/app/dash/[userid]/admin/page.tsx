import { buttonStyles } from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { BookCheck } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import { UncheckBooksQueryDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewerRoute } from '@/server/data/path-user'
import { serverQuery } from '@/server/data/query'
import { dashHref } from '@/utils/profile.utils'

import HomelessBookSyncInput from './sync-input'

const PAGE_SIZE = 50

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ offset?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('admin.meta.title') })
}

async function AdminPage(props: PageProps) {
  const [{ userid }, { offset: rawOffset }] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const viewer = await requireViewerRoute(userid, 'admin')
  // Non-admins learn nothing about this page existing.
  if (!viewer.isAdmin) notFound()
  const offset = Math.max(0, Number.parseInt(rawOffset ?? '0', 10) || 0)
  const [data, { t }] = await Promise.all([
    serverQuery(UncheckBooksQueryDocument, {
      pagination: { limit: PAGE_SIZE, offset },
    }),
    getTranslation(undefined, 'settings'),
  ])
  const books = data.adminDashboard.uncheckedBooks
  const base = dashHref(viewer, 'admin')
  const pageLink = (next: number) => `${base}?offset=${next}` as Route

  return (
    <Page width="default">
      <PageHeader
        eyebrow={t('admin.eyebrow')}
        title={t('admin.title')}
        description={t('admin.description')}
      />
      {books.length === 0 ? (
        <EmptyState
          icon={<BookCheck className="size-6" />}
          title={t('admin.empty')}
        />
      ) : (
        <ul className="rounded-lake-panel border-lake-line bg-lake-surface border">
          {books.map((book) => (
            <li
              key={book.title}
              className="border-lake-line flex flex-col gap-3 border-b px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-reading text-lake-fg">{book.title}</span>
              <HomelessBookSyncInput bookName={book.title} />
            </li>
          ))}
        </ul>
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
        {books.length === PAGE_SIZE ? (
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

export default AdminPage
