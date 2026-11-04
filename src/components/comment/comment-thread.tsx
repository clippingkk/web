'use client'

import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import LoadMoreFooter from '@/components/list/load-more-footer'
import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'

import CommentComposer from './comment-composer'
import CommentItem, { type CommentItemData } from './comment-item'
import type { CommentTarget } from './target'
import { useCommentPages } from './use-comment-pages'

type CommentThreadProps = {
  target: CommentTarget
  bookTitle?: string | null
  initialItems: CommentItemData[]
  initialCount: number
  pageSize: number
  viewer: {
    id: number
    name: string
    avatar?: string | null
    isPremium: boolean
    isAdmin?: boolean
  } | null
  /** Id of the heading, unique on the page. */
  headingId?: string
  /** Told the count after a post, a delete or a page that corrects it. */
  onCountChange?: (count: number) => void
}

function CommentThread(props: CommentThreadProps) {
  const {
    target,
    bookTitle,
    initialItems,
    initialCount,
    pageSize,
    viewer,
    headingId = 'discussion-title',
    onCountChange,
  } = props
  const { t } = useTranslation(undefined, 'reading')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  const isBook = target.kind === 'book'
  const doubanId = isBook ? target.doubanId : undefined
  const { items, count, loading, hasMore, loadMore, reload, remove } =
    useCommentPages({
      cid: isBook ? undefined : target.clippingId,
      doubanId,
      initialItems,
      initialCount,
      pageSize,
    })

  useEffect(() => {
    onCountChange?.(count)
  }, [count, onCountChange])

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6">
      <div className="border-lake-line flex items-baseline justify-between gap-3 border-b pb-4">
        <h2 id={headingId} className="type-heading text-lake-fg">
          {t('comments.title')}
        </h2>
        <p className="type-meta">{t('comments.count', { count })}</p>
      </div>

      {viewer ? (
        <CommentComposer
          target={target}
          bookTitle={bookTitle}
          viewer={viewer}
          onPosted={reload}
        />
      ) : (
        <EmptyState
          size="sm"
          icon={<MessageSquare className="size-5" />}
          title={t('comments.signInTitle')}
          description={
            isBook
              ? t('bookComments.signInDescription')
              : t('comments.signInDescription')
          }
          action={
            <Button
              variant="primary"
              size="sm"
              render={
                <Link
                  href={authHref(query ? `${pathname}?${query}` : pathname)}
                />
              }
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
              doubanId={doubanId}
              canModerate={viewer?.isAdmin}
              onDeleted={remove}
            />
          ))}
        </div>
      ) : viewer && !hasMore ? (
        <p className="type-meta py-4">
          {isBook ? t('bookComments.empty') : t('comments.empty')}
        </p>
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
