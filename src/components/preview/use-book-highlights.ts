'use client'

import { useApolloClient } from '@apollo/client/react'
import { useCallback, useEffect, useState } from 'react'

import { BookShelfDocument, type BookShelfQuery } from '@/gql/graphql'

import { countShareable, pickHighlights, randomWindow } from './poster-text'

export type BookHighlight = BookShelfQuery['book']['clippings'][number]
export type HighlightsStatus = 'idle' | 'loading' | 'ready' | 'error'

// The API serves at most 100 clippings per page.
const POOL_SIZE = 100

/**
 * Random public highlights from one reader's copy of a book. The pool is a
 * random page fetched once per session; shuffling re-picks from it locally.
 */
export function useBookHighlights({
  bookId,
  uid,
  total,
  enabled,
}: {
  bookId: number
  uid: number
  total: number
  enabled: boolean
}) {
  const client = useApolloClient()
  const [pool, setPool] = useState<BookHighlight[]>([])
  const [highlights, setHighlights] = useState<BookHighlight[]>([])
  const [status, setStatus] = useState<HighlightsStatus>(
    enabled ? 'loading' : 'idle'
  )
  const load = useCallback(() => {
    let cancelled = false
    client
      .query({
        query: BookShelfDocument,
        variables: {
          id: bookId,
          uid,
          pagination: randomWindow(total, POOL_SIZE),
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        if (cancelled) return
        const clippings = data?.book.clippings ?? []
        setPool(clippings)
        setHighlights(pickHighlights(clippings))
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [client, bookId, uid, total])

  useEffect(() => {
    if (enabled) return load()
  }, [enabled, load])

  const shuffle = useCallback(() => {
    setHighlights((current) =>
      pickHighlights(pool, { exclude: current.map((item) => item.id) })
    )
  }, [pool])

  const retry = useCallback(() => {
    setStatus('loading')
    load()
  }, [load])

  return {
    highlights,
    status,
    canShuffle: countShareable(pool) > highlights.length,
    shuffle,
    retry,
  }
}
