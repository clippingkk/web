'use client'

import SegmentedControl from '@annatarhe/lake-ui/segmented-control'
import { useApolloClient } from '@apollo/client/react'
import { LayoutGrid, Rows3 } from 'lucide-react'
import { useCallback, useState } from 'react'

import ClippingCard from '@/components/clipping/clipping-card'
import LoadMoreFooter from '@/components/list/load-more-footer'
import MasonryGrid from '@/components/list/masonry-grid'
import {
  FetchSquareDataDocument,
  type FetchSquareDataQuery,
} from '@/gql/graphql'
import { useMultipleBook } from '@/hooks/book'
import { useTranslation } from '@/i18n/client'
import { IN_APP_CHANNEL } from '@/services/channel'
import { clippingHref } from '@/utils/profile.utils'

type SquareClipping = FetchSquareDataQuery['featuredClippings'][number]

type SquareFeedProps = {
  initialItems: SquareClipping[]
  pageSize: number
}

function SquareFeed({ initialItems, pageSize }: SquareFeedProps) {
  const { t } = useTranslation(undefined, 'library')
  const client = useApolloClient()
  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(initialItems.length >= pageSize)
  const [loading, setLoading] = useState(false)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const { books } = useMultipleBook(items.map((c) => c.bookID))
  const titleById = new Map(books.map((b) => [String(b.doubanId), b.title]))

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    const lastId = items.at(-1)?.id
    if (!lastId) return
    setLoading(true)
    try {
      const { data } = await client.query({
        query: FetchSquareDataDocument,
        variables: { pagination: { limit: pageSize, lastId } },
        fetchPolicy: 'network-only',
      })
      const next = data?.featuredClippings ?? []
      setItems((current) => {
        const seen = new Set(current.map((c) => c.id))
        return [...current, ...next.filter((c) => !seen.has(c.id))]
      })
      setHasMore(next.length >= pageSize)
    } finally {
      setLoading(false)
    }
  }, [client, items, pageSize, loading, hasMore])

  const renderCard = (c: SquareClipping, variant: 'grid' | 'list') => (
    <ClippingCard
      variant={variant}
      clipping={c}
      bookTitle={titleById.get(c.bookID)}
      creator={c.creator}
      href={clippingHref(c.creator, c.id, IN_APP_CHANNEL.clippingFromUser)}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <SegmentedControl
          aria-label={t('square.layout.label')}
          size="sm"
          value={layout}
          onValueChange={setLayout}
          options={[
            {
              value: 'grid',
              label: t('square.layout.grid'),
              icon: <LayoutGrid className="size-4" />,
            },
            {
              value: 'list',
              label: t('square.layout.list'),
              icon: <Rows3 className="size-4" />,
            },
          ]}
        />
      </div>
      {layout === 'grid' ? (
        <MasonryGrid
          items={items}
          getKey={(c) => c.id}
          estimateHeight={(c) => 150 + Math.min(c.content.length, 600)}
          renderItem={(c) => renderCard(c, 'grid')}
        />
      ) : (
        <div className="mx-auto w-full max-w-3xl">
          {items.map((c) => (
            <div key={c.id}>{renderCard(c, 'list')}</div>
          ))}
        </div>
      )}
      <LoadMoreFooter
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
      />
    </div>
  )
}

export default SquareFeed
