import { Loader2 } from 'lucide-react'

import { useTranslation } from '@/i18n/client'

type InfiniteScrollFooterProps = {
  state: 'loading' | 'hasMore' | 'end'
  onLoadMore?: () => void
}

function InfiniteScrollFooter(props: InfiniteScrollFooterProps) {
  const { state, onLoadMore } = props
  const { t } = useTranslation(undefined, 'book')

  if (state === 'loading') {
    return (
      <div className="mt-2 flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400">
        <Loader2 size={16} className="animate-spin text-blue-400" />
        <span>{t('app.book.clippings.loading')}</span>
      </div>
    )
  }

  if (state === 'hasMore') {
    return (
      <div className="mt-2 flex justify-center py-8">
        <button
          type="button"
          onClick={onLoadMore}
          className="rounded-xl border border-blue-200/60 bg-white/70 px-5 py-2 text-sm font-medium text-blue-500 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-blue-400/30 dark:bg-slate-800/60 dark:text-blue-300 dark:hover:border-blue-400/60 dark:hover:bg-blue-400/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {t('app.book.clippings.loadMore')}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-2 flex items-center gap-4 py-8">
      <div className="h-px flex-grow bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      <span className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
        {t('app.book.clippings.end')}
      </span>
      <div className="h-px flex-grow bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
    </div>
  )
}

export default InfiniteScrollFooter
