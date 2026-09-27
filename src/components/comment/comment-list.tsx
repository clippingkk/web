'use client'

import EmptyState from '@annatarhe/lake-ui/empty-state'
import { useApolloClient } from '@apollo/client/react'
import { MessageSquare } from 'lucide-react'
import { useCallback, useState } from 'react'

import LoadMoreFooter from '@/components/list/load-more-footer'
import { GetCommentListDocument } from '@/gql/graphql'

import CommentItem, { type CommentItemData } from './comment-item'

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
  const client = useApolloClient()
  const [items, setItems] = useState(initialItems)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(async () => {
    const lastId = items.at(-1)?.id
    if (!lastId || loading) return
    setLoading(true)
    try {
      const { data } = await client.query({
        query: GetCommentListDocument,
        variables: { uid, pagination: { limit: pageSize, lastId } },
        fetchPolicy: 'network-only',
      })
      const next = data?.getCommentList.items ?? []
      setItems((current) => {
        const seen = new Set(current.map((c) => c.id))
        return [...current, ...next.filter((c) => !seen.has(c.id))]
      })
      if (next.length < pageSize)
        setCount((n) => Math.min(n, items.length + next.length))
    } finally {
      setLoading(false)
    }
  }, [client, uid, pageSize, items, loading])

  const onDeleted = useCallback((id: number) => {
    setItems((current) => current.filter((c) => c.id !== id))
    setCount((n) => Math.max(0, n - 1))
  }, [])

  if (items.length === 0) {
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
          onDeleted={onDeleted}
        />
      ))}
      <LoadMoreFooter
        hasMore={items.length < count}
        loading={loading}
        onLoadMore={loadMore}
        showEnd={count > pageSize}
      />
    </div>
  )
}

export default CommentList
