import EmptyState from '@annatarhe/lake-ui/empty-state'
import { BookCheck } from 'lucide-react'
import type { Metadata } from 'next'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import BackToLibraryButton from '@/components/user/back-to-library-button'
import { BookShelfDocument, type BookShelfQuery } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewerRoute } from '@/server/data/path-user'
import { serverQuery } from '@/server/data/query'
import { dashHref } from '@/utils/profile.utils'

import UncheckedGroup, { type UncheckedGroupData } from './unchecked-group'

// The API caps a page at 100; a few pages covers any real import.
const PAGE_SIZE = 100
const MAX_PAGES = 5

type PageProps = {
  params: Promise<{ userid: string }>
}

type Clipping = BookShelfQuery['book']['clippings'][number]

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'library')
  return pageMetadata({ title: t('unchecked.meta.title') })
}

async function loadUnchecked(uid: number): Promise<Clipping[]> {
  const page = (offset: number) =>
    serverQuery(
      BookShelfDocument,
      { id: 0, uid, pagination: { limit: PAGE_SIZE, offset } },
      { notFound: 'null' }
    )
  const first = await page(0)
  if (!first) return []
  const total = Math.min(first.book.clippingsCount, PAGE_SIZE * MAX_PAGES)
  const rest = await Promise.all(
    Array.from(
      { length: Math.max(0, Math.ceil(total / PAGE_SIZE) - 1) },
      (_, i) => page((i + 1) * PAGE_SIZE)
    )
  )
  return [first, ...rest].flatMap((r) => r?.book.clippings ?? [])
}

/** One row per Kindle title: matching one clipping moves them all. */
function groupByTitle(clippings: Clipping[]): UncheckedGroupData[] {
  const groups = new Map<string, UncheckedGroupData>()
  for (const clipping of clippings) {
    const title = clipping.title.trim()
    const group = groups.get(title)
    if (group) {
      group.count += 1
      continue
    }
    groups.set(title, {
      title,
      count: 1,
      clippingId: clipping.id,
      sample: clipping.content,
    })
  }
  return [...groups.values()].sort((a, b) => b.count - a.count)
}

async function UncheckedPage(props: PageProps) {
  const { userid } = await props.params
  const viewer = await requireViewerRoute(userid, 'unchecked')
  const [clippings, { t }] = await Promise.all([
    loadUnchecked(viewer.id),
    getTranslation(undefined, 'library'),
  ])
  const groups = groupByTitle(clippings)

  return (
    <Page width="reading">
      <PageHeader
        back={{ href: dashHref(viewer, 'home'), label: t('unchecked.back') }}
        eyebrow={t('unchecked.eyebrow')}
        title={t('unchecked.title')}
        description={t('unchecked.description')}
      />
      {groups.length > 0 ? (
        <ul>
          {groups.map((group) => (
            <UncheckedGroup key={group.title} group={group} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<BookCheck className="size-6" />}
          title={t('unchecked.empty.title')}
          description={t('unchecked.empty.description')}
          action={<BackToLibraryButton label={t('unchecked.empty.action')} />}
        />
      )}
    </Page>
  )
}

export default UncheckedPage
