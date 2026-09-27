'use client'

import SegmentedControl from '@annatarhe/lake-ui/segmented-control'
import { useApolloClient } from '@apollo/client/react'
import { LayoutGrid, Rows3 } from 'lucide-react'
import { useCallback, useState } from 'react'

import ClippingCard from '@/components/clipping/clipping-card'
import LoadMoreFooter from '@/components/list/load-more-footer'
import MasonryGrid from '@/components/list/masonry-grid'
import { BookShelfDocument, type BookShelfQuery } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { IN_APP_CHANNEL } from '@/services/channel'
import { clippingHref } from '@/utils/profile.utils'

type BookClipping = BookShelfQuery['book']['clippings'][number]
type Order = 'newest' | 'oldest'
type Layout = 'grid' | 'list'

/**
 * The API pages newest-first by offset. "Oldest" walks the same pages from
 * the end and reverses each one, so ordering covers the whole book rather
 * than only what happens to be loaded.
 */
export function pageWindow(
  order: Order,
  loaded: number,
  total: number,
  pageSize: number
): { offset: number; limit: number } | null {
  if (loaded >= total) return null
  if (order === 'newest') return { offset: loaded, limit: pageSize }
  const end = total - loaded
  const offset = Math.max(0, end - pageSize)
  return { offset, limit: end - offset }
}

type BookClippingsProps = {
  bookId: number
  uid: number
  slug: string
  bookTitle: string
  totalCount: number
  initialClippings: BookClipping[]
  pageSize: number
  isOwner: boolean
}

function BookClippings(props: BookClippingsProps) {
  const {
    bookId,
    uid,
    slug,
    bookTitle,
    totalCount,
    initialClippings,
    pageSize,
    isOwner,
  } = props
  const { t } = useTranslation(undefined, 'library')
  const client = useApolloClient()
  const [order, setOrder] = useState<Order>('newest')
  const [layout, setLayout] = useState<Layout>('grid')
  const [items, setItems] = useState(initialClippings)
  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback(
    async (nextOrder: Order, loaded: number) => {
      const window = pageWindow(nextOrder, loaded, totalCount, pageSize)
      if (!window) return []
      const { data } = await client.query({
        query: BookShelfDocument,
        variables: { id: bookId, uid, pagination: window },
        fetchPolicy: 'network-only',
      })
      const page = data?.book.clippings ?? []
      return nextOrder === 'oldest' ? [...page].reverse() : page
    },
    [client, bookId, uid, totalCount, pageSize]
  )

  const loadMore = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const page = await fetchPage(order, items.length)
      setItems((current) => {
        const seen = new Set(current.map((c) => c.id))
        return [...current, ...page.filter((c) => !seen.has(c.id))]
      })
    } finally {
      setLoading(false)
    }
  }, [fetchPage, order, items.length, loading])

  const onOrderChange = useCallback(
    async (next: Order) => {
      if (next === order) return
      setOrder(next)
      if (next === 'newest') {
        setItems(initialClippings)
        return
      }
      setItems([])
      setLoading(true)
      try {
        setItems(await fetchPage(next, 0))
      } finally {
        setLoading(false)
      }
    },
    [order, initialClippings, fetchPage]
  )

  const renderCard = (clipping: BookClipping, variant: 'grid' | 'list') => (
    <ClippingCard
      variant={variant}
      clipping={clipping}
      hideSource
      bookTitle={bookTitle}
      showPrivate={isOwner}
      href={clippingHref(slug, clipping.id, IN_APP_CHANNEL.clippingFromBook)}
    />
  )

  return (
    <section aria-labelledby="book-highlights" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="book-highlights" className="type-heading text-lake-fg">
          {t('book.highlightsTitle')}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            aria-label={t('book.order.label')}
            size="sm"
            value={order}
            onValueChange={onOrderChange}
            options={[
              { value: 'newest', label: t('book.order.newest') },
              { value: 'oldest', label: t('book.order.oldest') },
            ]}
          />
          <SegmentedControl
            aria-label={t('book.layout.label')}
            size="sm"
            value={layout}
            onValueChange={setLayout}
            options={[
              {
                value: 'grid',
                label: t('book.layout.grid'),
                icon: <LayoutGrid className="size-4" />,
              },
              {
                value: 'list',
                label: t('book.layout.list'),
                icon: <Rows3 className="size-4" />,
              },
            ]}
          />
        </div>
      </div>

      {layout === 'grid' ? (
        <MasonryGrid
          items={items}
          getKey={(c) => c.id}
          estimateHeight={(c) => 120 + Math.min(c.content.length, 600)}
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
        hasMore={items.length < totalCount}
        loading={loading}
        onLoadMore={loadMore}
        showEnd={totalCount > pageSize}
      />
    </section>
  )
}

export default BookClippings
