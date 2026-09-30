import { and, count, desc, eq, isNull, or, sql } from 'drizzle-orm'

import { getDatabase } from '../db'
import { clippings } from '../db/schema'

/**
 * Clipping query building blocks shared by the GraphQL resolvers and the MCP
 * server, so both surfaces apply the same visibility and paging rules.
 */

export const activeClipping = isNull(clippings.deletedAt)

/** Cursor paging: `limit` is clamped to 1..100, `lastId` defaults past every id. */
export function page(args?: { limit?: number; lastId?: number | null }) {
  return {
    limit: Math.min(Math.max(args?.limit ?? 20, 1), 100),
    lastId: args?.lastId ?? 1 << 30,
  }
}

export function legacyPage(args?: { limit?: number; offset?: number }) {
  return {
    limit: Math.min(Math.max(args?.limit ?? 20, 1), 100),
    offset: Math.max(args?.offset ?? 0, 0),
  }
}

export function sourceFromEnum(value?: string | null) {
  return value === 'weread' ? 2 : value === 'unknown' ? 0 : 1
}

export function sourceToEnum(value: number) {
  return value === 2 ? 'weread' : value === 0 ? 'unknown' : 'kindle'
}

/** Public clippings, plus the viewer's own private ones when signed in. */
export function clippingVisibleTo(userId: number) {
  return userId
    ? or(eq(clippings.visible, true), eq(clippings.createdBy, userId))
    : eq(clippings.visible, true)
}

/** ILIKE pattern for a substring search, with the reader's `%`, `_` and `\` literal. */
export function containsPattern(query: unknown) {
  return `%${String(query).replace(/[\\%_]/g, '\\$&')}%`
}

/** A clipping belongs to a matched book unless its book id is `''` or `'0'`. */
export const matchedBook = sql`${clippings.bookId} not in ('', '0')`

/** The user's books (clippings grouped by Douban id), most recently read first. */
export async function booksForUser(
  uid: number,
  pagination: { limit: number; offset: number },
  viewerId: number
) {
  const rows = await getDatabase()
    .db.select({
      doubanId: clippings.bookId,
      clippingsCount: count(clippings.id),
      startReadingAt: sql<Date>`min(${clippings.createdAt})`,
      lastReadingAt: sql<Date>`max(${clippings.createdAt})`,
    })
    .from(clippings)
    .where(
      and(
        eq(clippings.createdBy, uid),
        activeClipping,
        clippingVisibleTo(viewerId),
        matchedBook
      )
    )
    .groupBy(clippings.bookId)
    .orderBy(desc(sql`max(${clippings.createdAt})`))
    .limit(pagination.limit)
    .offset(pagination.offset)
  return rows.map((row, index) => ({
    ...row,
    uid,
    isLastReadingBook: pagination.offset + index === 0,
  }))
}
