'use client'
import { BookOpen } from 'lucide-react'
import { Masonry, useInfiniteLoader } from 'masonic'
import { useMemo, useRef, useState } from 'react'

import BookClippingsToolbar, {
  type ClippingsViewMode,
} from '@/components/clipping-item/book-clippings-toolbar'
import InfiniteScrollFooter from '@/components/clipping-item/infinite-scroll-footer'
import SquareClippingCard from '@/components/clipping-item/square-clipping-card'
import { APP_API_STEP_LIMIT } from '@/constants/config'
import { useMultipleBook } from '@/hooks/book'
import { usePageTrack } from '@/hooks/tracke'
import { useMasonaryColumnCount } from '@/hooks/use-screen-size'
import { useTranslation } from '@/i18n/client'
import {
  type FetchSquareDataQuery,
  useFetchSquareDataQuery,
} from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'
import { uniqueById } from '@/utils/array'
import { getUserSlug } from '@/utils/profile.utils'

const SQUARE_CAP = 200

type SquareClipping = FetchSquareDataQuery['featuredClippings'][number]

type SquarePageContentProps = {
  squareData: FetchSquareDataQuery
}

function SquarePageContent(props: SquarePageContentProps) {
  usePageTrack('square')
  const { t } = useTranslation(undefined, 'translation')

  const masonaryColumnCount = useMasonaryColumnCount()
  const [view, setView] = useState<ClippingsViewMode>('masonry')

  const reachEnd = useRef(false)
  const loadingRef = useRef(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const [sqData, setSqData] = useState<SquareClipping[]>(
    props.squareData.featuredClippings
  )

  const { fetchMore } = useFetchSquareDataQuery({
    variables: {
      pagination: { limit: APP_API_STEP_LIMIT },
    },
    skip: true,
  })

  const books = useMultipleBook(sqData.map((x) => x.bookID) || [])

  const loadMore = async () => {
    if (reachEnd.current || loadingRef.current || sqData.length === 0) {
      return
    }
    if (sqData.length >= SQUARE_CAP) {
      reachEnd.current = true
      return
    }
    loadingRef.current = true
    setLoadingMore(true)
    try {
      const resp = await fetchMore({
        variables: {
          pagination: {
            limit: APP_API_STEP_LIMIT,
            lastId: sqData[sqData.length - 1].id,
          },
        },
      })
      const next = resp.data?.featuredClippings ?? []
      if (next.length === 0) {
        reachEnd.current = true
      } else {
        setSqData((prev) => uniqueById([...prev, ...next]))
      }
    } finally {
      loadingRef.current = false
      setLoadingMore(false)
    }
  }

  const maybeLoadMore = useInfiniteLoader<
    SquareClipping,
    (startIndex: number, stopIndex: number, items: SquareClipping[]) => void
  >(
    () => {
      void loadMore()
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      threshold: 3,
    }
  )

  const atCap = sqData.length >= SQUARE_CAP
  const footerState: 'loading' | 'hasMore' | 'end' = loadingMore
    ? 'loading'
    : reachEnd.current || atCap
      ? 'end'
      : 'hasMore'

  const columnCount = view === 'list' ? 1 : masonaryColumnCount
  const columnGutter = view === 'list' ? 0 : 24

  const items = useMemo(() => sqData, [sqData])

  if (items.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 px-6 py-16 text-center backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-400 dark:bg-blue-400/10 dark:text-blue-300">
          <BookOpen size={28} />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {t('app.square.empty.title')}
        </h3>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {t('app.square.empty.description')}
        </p>
      </div>
    )
  }

  return (
    <section aria-label="square-clippings" className="mt-2">
      <BookClippingsToolbar
        loadedCount={items.length}
        view={view}
        onViewChange={setView}
      />

      <Masonry
        key={`${view}-${columnCount}`}
        items={items}
        columnCount={columnCount}
        columnGutter={columnGutter}
        className="with-slide-in"
        onRender={maybeLoadMore}
        itemKey={(item: SquareClipping) => item.id}
        render={(row) => {
          const clipping = row.data
          return (
            <SquareClippingCard
              item={clipping}
              book={books.books.find(
                (x) => x.doubanId.toString() === clipping.bookID
              )}
              creator={clipping.creator}
              domain={getUserSlug(clipping.creator).toString()}
              density={view === 'list' ? 'compact' : 'default'}
              inAppChannel={IN_APP_CHANNEL.clippingFromUser}
            />
          )
        }}
      />

      <InfiniteScrollFooter state={footerState} onLoadMore={loadMore} />

      {atCap && (
        <p className="pb-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {t('app.square.reachedCap')}
        </p>
      )}
    </section>
  )
}

export default SquarePageContent
