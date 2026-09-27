'use client'

import { useApolloClient } from '@apollo/client/react'
import { useCallback, useState } from 'react'

import { GetCommentListDocument } from '@/gql/graphql'

import type { CommentItemData } from './comment-item'

type UseCommentPagesOptions = {
  /** Comments on one clipping… */
  cid?: number
  /** …or everything one reader has written. */
  uid?: number
  initialItems: CommentItemData[]
  initialCount: number
  pageSize: number
}

/** Cursor paging over getCommentList, shared by every comment list. */
export function useCommentPages(options: UseCommentPagesOptions) {
  const { cid, uid, initialItems, initialCount, pageSize } = options
  const client = useApolloClient()
  const [items, setItems] = useState(initialItems)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback(
    async (lastId?: number) => {
      const { data } = await client.query({
        query: GetCommentListDocument,
        variables: { cid, uid, pagination: { limit: pageSize, lastId } },
        fetchPolicy: 'network-only',
      })
      return data?.getCommentList
    },
    [client, cid, uid, pageSize]
  )

  const reload = useCallback(async () => {
    const page = await fetchPage()
    if (!page) return
    setItems(page.items)
    setCount(page.count)
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    if (loading) return
    const lastId = items.at(-1)?.id
    // every loaded comment was deleted: start again from the top
    if (!lastId) return reload()
    setLoading(true)
    const page = await fetchPage(lastId).finally(() => setLoading(false))
    const next = page?.items ?? []
    const seen = new Set(items.map((c) => c.id))
    const fresh = next.filter((c) => !seen.has(c.id))
    setItems((current) => [...current, ...fresh])
    // a short page means the list has ended, whatever the count said
    if (next.length < pageSize)
      setCount((n) => Math.min(n, items.length + fresh.length))
  }, [items, loading, fetchPage, pageSize, reload])

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((c) => c.id !== id))
    setCount((n) => Math.max(0, n - 1))
  }, [])

  return {
    items,
    count,
    loading,
    hasMore: items.length < count,
    loadMore,
    reload,
    remove,
  }
}
