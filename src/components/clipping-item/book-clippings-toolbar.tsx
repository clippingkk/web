import {
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react'

import { useTranslation } from '@/i18n/client'

export type ClippingsSortOrder = 'newest' | 'oldest'
export type ClippingsViewMode = 'masonry' | 'list'

type BookClippingsToolbarProps = {
  totalCount?: number
  loadedCount: number
  sort?: ClippingsSortOrder
  onSortChange?: (next: ClippingsSortOrder) => void
  view: ClippingsViewMode
  onViewChange: (next: ClippingsViewMode) => void
}

const baseSegButton =
  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'

function BookClippingsToolbar(props: BookClippingsToolbarProps) {
  const { totalCount, loadedCount, sort, onSortChange, view, onViewChange } =
    props
  const { t } = useTranslation(undefined, 'clippings')

  const showSort = sort !== undefined && onSortChange !== undefined
  const hasTotal = typeof totalCount === 'number'

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      {/* Summary */}
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {hasTotal
            ? t('app.clippings.toolbar.count', { count: totalCount })
            : t('app.clippings.toolbar.loaded', { count: loadedCount })}
        </span>
        {hasTotal && loadedCount > 0 && loadedCount < totalCount! && (
          <span className="text-xs text-slate-400 tabular-nums dark:text-slate-500">
            · {loadedCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort segmented toggle */}
        {showSort && (
          <div
            role="group"
            aria-label="Sort"
            className="flex items-center gap-0.5 rounded-xl border border-slate-200/70 bg-white/60 p-1 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50"
          >
            <button
              type="button"
              aria-pressed={sort === 'newest'}
              onClick={() => onSortChange!('newest')}
              className={`${baseSegButton} ${
                sort === 'newest'
                  ? 'bg-blue-400 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <ArrowDownNarrowWide size={14} />
              <span className="hidden sm:inline">
                {t('app.clippings.toolbar.sort.newest')}
              </span>
            </button>
            <button
              type="button"
              aria-pressed={sort === 'oldest'}
              onClick={() => onSortChange!('oldest')}
              className={`${baseSegButton} ${
                sort === 'oldest'
                  ? 'bg-blue-400 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <ArrowUpWideNarrow size={14} />
              <span className="hidden sm:inline">
                {t('app.clippings.toolbar.sort.oldest')}
              </span>
            </button>
          </div>
        )}

        {/* View mode toggle */}
        <div
          role="group"
          aria-label="View"
          className="flex items-center gap-0.5 rounded-xl border border-slate-200/70 bg-white/60 p-1 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50"
        >
          <button
            type="button"
            aria-label={t('app.clippings.toolbar.view.masonry')}
            title={t('app.clippings.toolbar.view.masonry')}
            aria-pressed={view === 'masonry'}
            onClick={() => onViewChange('masonry')}
            className={`${baseSegButton} ${
              view === 'masonry'
                ? 'bg-blue-400 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            aria-label={t('app.clippings.toolbar.view.list')}
            title={t('app.clippings.toolbar.view.list')}
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
            className={`${baseSegButton} ${
              view === 'list'
                ? 'bg-blue-400 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookClippingsToolbar
