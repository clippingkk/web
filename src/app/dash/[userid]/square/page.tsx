import EmptyState from '@annatarhe/lake-ui/empty-state'
import { HydrationBoundary } from '@tanstack/react-query'
import { Quote } from 'lucide-react'
import type { Metadata } from 'next'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import { FetchSquareDataDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { serverQuery } from '@/server/data/query'
import { prefetchWenquBooks } from '@/server/data/wenqu'

import SquareFeed from './square-feed'

const PAGE_SIZE = 24

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'library')
  return pageMetadata({
    title: t('square.meta.title'),
    description: t('square.meta.description'),
  })
}

async function SquarePage() {
  const [data, { t }] = await Promise.all([
    serverQuery(FetchSquareDataDocument, {
      pagination: { limit: PAGE_SIZE },
    }),
    getTranslation(undefined, 'library'),
  ])
  const items = data.featuredClippings
  const prefetched = await prefetchWenquBooks(items.map((c) => c.bookID))

  return (
    <Page width="wide">
      <PageHeader
        eyebrow={t('square.eyebrow')}
        title={t('square.title')}
        description={t('square.description')}
      />
      {items.length > 0 ? (
        <HydrationBoundary state={prefetched.state}>
          <SquareFeed initialItems={items} pageSize={PAGE_SIZE} />
        </HydrationBoundary>
      ) : (
        <EmptyState
          icon={<Quote className="size-6" />}
          title={t('square.empty.title')}
          description={t('square.empty.description')}
        />
      )}
    </Page>
  )
}

export default SquarePage
