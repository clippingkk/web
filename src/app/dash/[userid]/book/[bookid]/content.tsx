'use client'
import { useQuery } from '@apollo/client/react'
import { BookOpen } from 'lucide-react'
import { Masonry, useInfiniteLoader } from 'masonic'
import { useMemo, useRef, useState } from 'react'

import BookClippingCard from '@/components/clipping-item/book-clipping-card'
import BookClippingsToolbar, {
  type ClippingsSortOrder,
  type ClippingsViewMode,
} from '@/components/clipping-item/book-clippings-toolbar'
import { BOOK_CLIPPINGS_PAGE_SIZE } from '@/constants/features'
import InfiniteScrollFooter from '@/components/clipping-item/infinite-scroll-footer'
import { usePageTrack } from '@/hooks/tracke'
import { useMasonaryColumnCount } from '@/hooks/use-screen-size'
import { useTranslation } from '@/i18n/client'
import { BookDocument, type BookQuery } from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'
import type { WenquBook } from '@/services/wenqu'
import { uniqueById } from '@/utils/array'

type BookClippingsItem = NonNullable<BookQuery['book']['clippings']>[number]

type BookPageContentProps = {
  userid: string
  book: WenquBook
}

function BookPageContent(props: BookPageContentProps) {
  const { userid: domain, book: bookData } = props
  const { t } = useTranslation(undefined, 'book')
  usePageTrack('book', {
    bookId: bookData.id,
  })

  const [extraItems, setExtraItems] = useState<BookClippingsItem[]>([])
  const loadingRef = useRef(false)

  const { data: clippingsData, fetchMore } = useQuery<BookQuery>(BookDocument, {
    variables: {
      id: bookData.doubanId,
      pagination: {
        limit: BOOK_CLIPPINGS_PAGE_SIZE,
        offset: 0,
      },
    },
    notifyOnNetworkStatusChange: true,
  })

  const initialClippings = (clippingsData?.book.clippings ?? []) as
    | BookClippingsItem[]
    | never[]
  const totalCount = clippingsData?.book.clippingsCount ?? 0

  // Merge + dedupe server page + loaded pages.
  const mergedItems = useMemo(
    () => uniqueById<BookClippingsItem>([...initialClippings, ...extraItems]),
    [initialClippings, extraItems]
  )

  const [sort, setSort] = useState<ClippingsSortOrder>('newest')
  const [view, setView] = useState<ClippingsViewMode>('masonry')

  // Client-side sort of loaded items. A backend `orderBy` arg is a follow-up;
  // until then this gives the user instant control over loaded rows.
  const renderList = useMemo(() => {
    if (mergedItems.length < 2) {
      return mergedItems
    }
    const copy = [...mergedItems]
    copy.sort((a, b) => {
      const delta = (b.id as number) - (a.id as number)
      return sort === 'newest' ? delta : -delta
    })
    return copy
  }, [mergedItems, sort])

  const hasMore = mergedItems.length < totalCount
  const [loadingMore, setLoadingMore] = useState(false)

  const loadMore = async () => {
    if (!hasMore || loadingRef.current || mergedItems.length === 0) {
      return
    }
    loadingRef.current = true
    setLoadingMore(true)
    try {
      const resp = await fetchMore({
        variables: {
          id: bookData.doubanId,
          pagination: {
            limit: BOOK_CLIPPINGS_PAGE_SIZE,
            offset: mergedItems.length,
          },
        },
      })
      const next = (resp.data?.book.clippings ?? []) as BookClippingsItem[]
      if (next.length > 0) {
        setExtraItems((prev) => [...prev, ...next])
      }
    } finally {
      loadingRef.current = false
      setLoadingMore(false)
    }
  }

  const masonaryColumnCount = useMasonaryColumnCount()
  const maybeLoadMore = useInfiniteLoader(
    async () => {
      if (!hasMore) {
        return
      }
      await loadMore()
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      threshold: 3,
      totalItems: totalCount,
    }
  )

  // Initial loading state — rendered by the Suspense skeleton instead.
  if (!clippingsData) {
    return null
  }

  // Empty state
  if (totalCount === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 px-6 py-16 text-center backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-400 dark:bg-blue-400/10 dark:text-blue-300">
          <BookOpen size={28} />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {t('app.book.clippings.empty.title')}
        </h3>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {t('app.book.clippings.empty.description')}
        </p>
      </div>
    )
  }

  const footerState: 'loading' | 'hasMore' | 'end' = loadingMore
    ? 'loading'
    : hasMore
      ? 'hasMore'
      : 'end'

  const columnCount = view === 'list' ? 1 : masonaryColumnCount
  const columnGutter = view === 'list' ? 0 : 24

  return (
    <section aria-label="clippings" className="mt-2">
      <BookClippingsToolbar
        totalCount={totalCount}
        loadedCount={mergedItems.length}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      <Masonry
        // Keying on view/sort forces Masonic to recalc layout cleanly.
        key={`${view}-${sort}-${columnCount}`}
        items={renderList}
        columnCount={columnCount}
        columnGutter={columnGutter}
        onRender={maybeLoadMore}
        itemKey={(item: BookClippingsItem) => item.id}
        render={(row) => {
          const clipping = row.data as BookClippingsItem
          return (
            <BookClippingCard
              item={clipping}
              domain={domain}
              density={view === 'list' ? 'compact' : 'default'}
              inAppChannel={IN_APP_CHANNEL.clippingFromBook}
            />
          )
        }}
      />

      <InfiniteScrollFooter state={footerState} onLoadMore={loadMore} />
    </section>
  )
}

export default BookPageContent
