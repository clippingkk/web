import type { PublicDataQuery } from '@/gql/graphql'
import { isValidDoubanId } from '@/services/wenqu'
import type { SlugUser } from '@/utils/profile.utils'

export type PublicData = PublicDataQuery['public']
export type PublicClipping = PublicData['clippings'][number]
export type PublicReader = PublicData['users'][number]

export type ShelfBook = {
  doubanId: string
  /** Whose shelf the book links to: a reader with public highlights in it. */
  owner: SlugUser
  /** Kindle title, for the typographic cover when Wenqu has no record. */
  title?: string | null
  clippingsCount?: number
}

const QUOTE_MIN = 24
const QUOTE_MAX = 360

function quoteLength(clipping: PublicClipping) {
  return clipping.content.trim().length
}

/**
 * Up to `count` public highlights for the landing page: quotes of a readable
 * length first, one per reader while that is possible, newest first.
 */
export function pickFeaturedClippings(
  clippings: readonly PublicClipping[],
  count: number
): PublicClipping[] {
  const readable = clippings.filter((c) => {
    const length = quoteLength(c)
    return length >= QUOTE_MIN && length <= QUOTE_MAX
  })
  const picked: PublicClipping[] = []
  const creators = new Set<number>()
  for (const c of readable) {
    if (picked.length >= count) break
    if (creators.has(c.creator.id)) continue
    creators.add(c.creator.id)
    picked.push(c)
  }
  for (const c of [...readable, ...clippings]) {
    if (picked.length >= count) break
    if (!picked.includes(c) && quoteLength(c) > 0) picked.push(c)
  }
  return picked
}

/**
 * Books for "On the shelves". A book page lives under a reader
 * (`/dash/[user]/book/[id]`), and `public.books` does not say whose shelf a
 * row came from, so each book links to a reader whose public highlights
 * include it. The most-highlighted books come first; books from the latest
 * public highlights fill the rest.
 */
export function pickShelfBooks(
  data: Pick<PublicData, 'books' | 'clippings'>,
  count: number
): ShelfBook[] {
  const fromClippings = new Map<string, ShelfBook>()
  for (const c of data.clippings) {
    if (!isValidDoubanId(c.bookID) || fromClippings.has(c.bookID)) continue
    fromClippings.set(c.bookID, {
      doubanId: c.bookID,
      owner: c.creator,
      title: c.title,
    })
  }

  const shelf: ShelfBook[] = []
  const seen = new Set<string>()
  for (const book of data.books) {
    const match = fromClippings.get(book.doubanId)
    if (!match || seen.has(book.doubanId)) continue
    seen.add(book.doubanId)
    shelf.push({ ...match, clippingsCount: book.clippingsCount })
  }
  for (const book of fromClippings.values()) {
    if (seen.has(book.doubanId)) continue
    seen.add(book.doubanId)
    shelf.push(book)
  }
  return shelf.slice(0, count)
}

/** Readers for the strip: named readers first, those with a photo on top. */
export function pickReaders(
  users: readonly PublicReader[],
  count: number
): PublicReader[] {
  const named = users.filter((u) => u.name && !u.name.startsWith('user.'))
  const withAvatar = named.filter((u) => u.avatar && u.avatar !== 'null')
  const withoutAvatar = named.filter((u) => !u.avatar || u.avatar === 'null')
  return [...withAvatar, ...withoutAvatar].slice(0, count)
}
