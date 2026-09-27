'use client'

import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { useApolloClient } from '@apollo/client/react'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { GetCommentListDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'

import CommentComposer from './comment-composer'
import CommentItem, { type CommentItemData } from './comment-item'

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
  const client = useApolloClient()
  const pathname = usePathname()
  const [items, setItems] = useState(initialItems)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback(
    async (lastId?: number) => {
      const { data } = await client.query({
        query: GetCommentListDocument,
        variables: { cid: clippingId, pagination: { limit: pageSize, lastId } },
        fetchPolicy: 'network-only',
      })
      return data?.getCommentList
    },
    [client, clippingId, pageSize]
  )

  const reload = useCallback(async () => {
    const page = await fetchPage()
    if (!page) return
    setItems(page.items)
    setCount(page.count)
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    const lastId = items.at(-1)?.id
    if (!lastId || loading) return
    setLoading(true)
    try {
      const page = await fetchPage(lastId)
      if (!page) return
      setItems((current) => {
        const seen = new Set(current.map((c) => c.id))
        return [...current, ...page.items.filter((c) => !seen.has(c.id))]
      })
    } finally {
      setLoading(false)
    }
  }, [items, loading, fetchPage])

  const onDeleted = useCallback((id: number) => {
    setItems((current) => current.filter((c) => c.id !== id))
    setCount((n) => Math.max(0, n - 1))
  }, [])

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
              onDeleted={onDeleted}
            />
          ))}
        </div>
      ) : viewer ? (
        <p className="type-meta py-4">{t('comments.empty')}</p>
      ) : null}

      {items.length < count ? (
        <Button
          variant="ghost"
          size="sm"
          className="self-center"
          loading={loading}
          onClick={loadMore}
        >
          {t('comments.loadMore')}
        </Button>
      ) : null}
    </section>
  )
}

export default CommentThread
