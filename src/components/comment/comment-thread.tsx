'use client'

import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import LoadMoreFooter from '@/components/list/load-more-footer'
import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'

import CommentComposer from './comment-composer'
import CommentItem, { type CommentItemData } from './comment-item'
import { useCommentPages } from './use-comment-pages'

type CommentThreadProps = {
  clippingId: number
  bookTitle?: string | null
  initialItems: CommentItemData[]
  initialCount: number
  pageSize: number
  viewer: {
    id: number
    name: string
    avatar?: string | null
    isPremium: boolean
  } | null
}

function CommentThread(props: CommentThreadProps) {
  const {
    clippingId,
    bookTitle,
    initialItems,
    initialCount,
    pageSize,
    viewer,
  } = props
  const { t } = useTranslation(undefined, 'reading')
  const pathname = usePathname()
  const { items, count, loading, hasMore, loadMore, reload, remove } =
    useCommentPages({ cid: clippingId, initialItems, initialCount, pageSize })

  return (
    <section aria-labelledby="discussion-title" className="flex flex-col gap-6">
      <div className="border-lake-line flex items-baseline justify-between gap-3 border-b pb-4">
        <h2 id="discussion-title" className="type-heading text-lake-fg">
          {t('comments.title')}
        </h2>
        <p className="type-meta">{t('comments.count', { count })}</p>
      </div>

      {viewer ? (
        <CommentComposer
          clippingId={clippingId}
          bookTitle={bookTitle}
          viewer={viewer}
          onPosted={reload}
        />
      ) : (
        <EmptyState
          size="sm"
          icon={<MessageSquare className="size-5" />}
          title={t('comments.signInTitle')}
          description={t('comments.signInDescription')}
          action={
            <Button
              variant="primary"
              size="sm"
              render={<Link href={authHref(pathname)} />}
            >
              {t('comments.signIn')}
            </Button>
          }
        />
      )}

      {items.length > 0 ? (
        <div>
          {items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              viewerId={viewer?.id}
              onDeleted={remove}
            />
          ))}
        </div>
      ) : viewer && !hasMore ? (
        <p className="type-meta py-4">{t('comments.empty')}</p>
      ) : null}

      {items.length > 0 || hasMore ? (
        <LoadMoreFooter
          hasMore={hasMore}
          loading={loading}
          onLoadMore={loadMore}
          showEnd={count > pageSize}
        />
      ) : null}
    </section>
  )
}

export default CommentThread
