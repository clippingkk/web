import 'server-only'
import { dehydrate, type DehydratedState } from '@tanstack/react-query'

import { getReactQueryClient } from '@/services/ajax'
import {
  chunkDoubanIds,
  type WenquBook,
  wenquBooksByIdsQueryOptions,
} from '@/services/wenqu'

export type PrefetchedBooks = {
  /** Hydrates the client's useMultipleBook queries (same chunk keys). */
  state: DehydratedState
  byId: Map<string, WenquBook>
}

/**
 * Fetches Wenqu metadata for the given Douban ids into the request's query
 * client. Wenqu being slow or down never fails the page: covers fall back
 * to the typographic cover.
 */
export async function prefetchWenquBooks(
  doubanIds: readonly string[]
): Promise<PrefetchedBooks> {
  const rq = getReactQueryClient()
  const chunks = chunkDoubanIds(doubanIds)
  const results = await Promise.allSettled(
    chunks.map((chunk) => rq.fetchQuery(wenquBooksByIdsQueryOptions(chunk)))
  )
  const byId = new Map<string, WenquBook>()
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const book of result.value.books) {
      byId.set(String(book.doubanId), book)
    }
  }
  return { state: dehydrate(rq), byId }
}
