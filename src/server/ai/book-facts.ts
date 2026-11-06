import {
  chunkDoubanIds,
  wenquRequest,
  type WenquBook,
  type WenquSearchResponse,
} from '@/services/wenqu'

const WENQU_TIMEOUT_MS = 4_000

/**
 * Book metadata for a prompt. It only enriches the prompt, so a slow or broken
 * Wenqu costs detail and never the generation.
 */
export async function loadBooks(
  bookIds: readonly string[]
): Promise<Map<string, WenquBook>> {
  const batches = await Promise.allSettled(
    chunkDoubanIds(bookIds).map((ids) =>
      wenquRequest<WenquSearchResponse>(
        `/books/search?dbIds=${ids.join('&dbIds=')}`,
        { signal: AbortSignal.timeout(WENQU_TIMEOUT_MS) }
      )
    )
  )
  return new Map(
    batches
      .flatMap((batch) =>
        batch.status === 'fulfilled' ? batch.value.books : []
      )
      .map((book) => [String(book.doubanId), book])
  )
}
