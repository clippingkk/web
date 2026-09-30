import {
  chunkDoubanIds,
  isValidDoubanId,
  wenquRequest,
  type WenquBook,
  type WenquSearchResponse,
} from '@/services/wenqu'

import { cacheGet, cacheSet } from '../redis'

/**
 * Book metadata from Wenqu, for the MCP tools. Titles rarely change, so each
 * book is cached in Redis for the same three days the web client keeps them;
 * a Wenqu or Redis failure degrades to "no metadata", never to a failed tool
 * call, because the Kindle title on the clipping is still there to show.
 */
const TTL_SECONDS = 3 * 24 * 60 * 60
const key = (doubanId: string) => `ck:mcp:wenqu:${doubanId}`

export interface BookMeta {
  title: string
  author: string
  cover: string
  press: string
  pubdate: string
  isbn: string
  rating: number
  totalPages: number
  tags: string[]
  summary: string
  doubanUrl: string
}

function meta(book: WenquBook): BookMeta {
  return {
    title: book.title,
    author: book.author,
    cover: book.image,
    press: book.press,
    pubdate: book.pubdate,
    isbn: book.isbn,
    rating: book.rating,
    totalPages: book.totalPages,
    tags: book.tags ?? [],
    summary: book.summary,
    doubanUrl: book.url,
  }
}

export async function booksByDoubanIds(
  doubanIds: readonly string[]
): Promise<Map<string, BookMeta>> {
  const found = new Map<string, BookMeta>()
  const missing: string[] = []
  await Promise.all(
    [...new Set(doubanIds)].filter(isValidDoubanId).map(async (id) => {
      const cached = await cacheGet<BookMeta>(key(id)).catch(() => undefined)
      if (cached) found.set(id, cached)
      else missing.push(id)
    })
  )
  await Promise.all(
    chunkDoubanIds(missing).map(async (chunk) => {
      const query = chunk
        .map((id) => `dbIds=${encodeURIComponent(id)}`)
        .join('&')
      const response = await wenquRequest<WenquSearchResponse>(
        `/books/search?${query}`
      ).catch(() => null)
      for (const book of response?.books ?? []) {
        const id = String(book.doubanId)
        found.set(id, meta(book))
        await cacheSet(key(id), meta(book), TTL_SECONDS).catch(() => {})
      }
    })
  )
  return found
}
