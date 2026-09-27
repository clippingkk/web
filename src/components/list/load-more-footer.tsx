'use client'

import Button from '@annatarhe/lake-ui/button'
import useInViewport from '@annatarhe/lake-ui/hooks/use-in-viewport'
import Spinner from '@annatarhe/lake-ui/spinner'

import { useTranslation } from '@/i18n/client'

type LoadMoreFooterProps = {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  /** Hide the end-of-list note for short lists. */
  showEnd?: boolean
}

/**
 * Loads the next page when it scrolls into view, with a button as the
 * keyboard/no-IntersectionObserver fallback.
 */
function LoadMoreFooter(props: LoadMoreFooterProps) {
  const { hasMore, loading, onLoadMore, showEnd = true } = props
  const { t } = useTranslation(undefined, 'common')
  const sentinelRef = useInViewport(
    () => {
      if (hasMore && !loading) onLoadMore()
    },
    { rootMargin: '600px 0px' }
  )

  if (!hasMore) {
    return showEnd ? (
      <p className="type-meta py-10 text-center">{t('list.end')}</p>
    ) : null
  }

  return (
    <div ref={sentinelRef} className="flex justify-center py-10">
      {loading ? (
        <Spinner size="sm" label={t('list.loading')} />
      ) : (
        <Button variant="ghost" size="sm" onClick={onLoadMore}>
          {t('list.loadMore')}
        </Button>
      )}
    </div>
  )
}

export default LoadMoreFooter
