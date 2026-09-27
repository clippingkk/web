'use client'

import EmptyState from '@annatarhe/lake-ui/empty-state'
import { MessageSquare } from 'lucide-react'

import LoadMoreFooter from '@/components/list/load-more-footer'

import CommentItem, { type CommentItemData } from './comment-item'
import { useCommentPages } from './use-comment-pages'

type CommentListProps = {
  uid: number
  initialItems: CommentItemData[]
  initialCount: number
  pageSize: number
  viewerId?: number | null
  emptyTitle: string
  emptyDescription?: string
}

/** A reader's comments, each quoting the highlight it belongs to. */
function CommentList(props: CommentListProps) {
  const {
    uid,
    initialItems,
    initialCount,
    pageSize,
    viewerId,
    emptyTitle,
    emptyDescription,
  } = props
  const { items, count, loading, hasMore, loadMore, remove } = useCommentPages({
    uid,
    initialItems,
    initialCount,
    pageSize,
  })

  if (items.length === 0 && !hasMore) {
    return (
      <EmptyState
        icon={<MessageSquare className="size-6" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div>
      {items.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          variant="with-context"
          viewerId={viewerId}
          onDeleted={remove}
        />
      ))}
      <LoadMoreFooter
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        showEnd={count > pageSize}
      />
    </div>
  )
}

export default CommentList
