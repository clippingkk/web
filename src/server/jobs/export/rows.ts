import { and, asc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm'

import { getDatabase } from '../../db'
import { clippings } from '../../db/schema'

export const EXPORT_BATCH_SIZE = 100

export type HighlightRow = {
  id: number
  title: string
  content: string
  pageAt: string
  bookId: string
  createdAt: Date
}

export type HighlightCursor = {
  createdAt: Date
  id: number
}

export type BookGroup = {
  key: string
  bookId: string
  title: string
}

const highlightColumns = {
  id: clippings.id,
  title: clippings.title,
  content: clippings.content,
  pageAt: clippings.pageAt,
  bookId: clippings.bookId,
  createdAt: clippings.createdAt,
}

function owned(uid: number) {
  return and(eq(clippings.createdBy, uid), isNull(clippings.deletedAt))
}

function afterCursor(cursor: HighlightCursor | null) {
  if (!cursor) return undefined
  return or(
    gt(clippings.createdAt, cursor.createdAt),
    and(eq(clippings.createdAt, cursor.createdAt), gt(clippings.id, cursor.id))
  )
}

/** One page of a reader's highlights, oldest first, strictly after `cursor`. */
export async function loadHighlightBatch(
  uid: number,
  cursor: HighlightCursor | null,
  limit: number
): Promise<HighlightRow[]> {
  return getDatabase()
    .db.select(highlightColumns)
    .from(clippings)
    .where(and(owned(uid), afterCursor(cursor)))
    .orderBy(asc(clippings.createdAt), asc(clippings.id))
    .limit(limit)
}

const bookKey = sql<string>`case when ${clippings.bookId} in ('', '0') then 'title:' || ${clippings.title} else 'id:' || ${clippings.bookId} end`

/** One group per matched book, or per Kindle title when the book is unmatched. */
export async function listBookGroups(uid: number): Promise<BookGroup[]> {
  const rows = await getDatabase()
    .db.select({
      key: bookKey,
      bookId: sql<string>`min(${clippings.bookId})`,
      title: sql<string>`min(${clippings.title})`,
    })
    .from(clippings)
    .where(owned(uid))
    .groupBy(bookKey)
    .orderBy(bookKey)
  return rows
}

function bookFilter(book: BookGroup) {
  if (book.bookId && book.bookId !== '0')
    return eq(clippings.bookId, book.bookId)
  return and(
    inArray(clippings.bookId, ['', '0']),
    eq(clippings.title, book.title)
  )
}

/** Highlights of one book, oldest first, strictly after `cursor`. */
export async function loadBookHighlightBatch(
  uid: number,
  book: BookGroup,
  cursor: HighlightCursor | null,
  limit: number
): Promise<HighlightRow[]> {
  return getDatabase()
    .db.select(highlightColumns)
    .from(clippings)
    .where(and(owned(uid), bookFilter(book), afterCursor(cursor)))
    .orderBy(asc(clippings.createdAt), asc(clippings.id))
    .limit(limit)
}

export async function forEachHighlightBatch(
  uid: number,
  batchSize: number,
  visit: (rows: HighlightRow[]) => Promise<void>,
  start: HighlightCursor | null = null
) {
  let cursor = start
  for (;;) {
    const rows = await loadHighlightBatch(uid, cursor, batchSize)
    if (rows.length === 0) return
    await visit(rows)
    const last = rows[rows.length - 1]
    cursor = { createdAt: last.createdAt, id: last.id }
    if (rows.length < batchSize) return
  }
}

export async function forEachBookHighlightBatch(
  uid: number,
  book: BookGroup,
  batchSize: number,
  visit: (rows: HighlightRow[]) => Promise<void>
) {
  let cursor: HighlightCursor | null = null
  for (;;) {
    const rows = await loadBookHighlightBatch(uid, book, cursor, batchSize)
    if (rows.length === 0) return
    await visit(rows)
    const last = rows[rows.length - 1]
    cursor = { createdAt: last.createdAt, id: last.id }
    if (rows.length < batchSize) return
  }
}
