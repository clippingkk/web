import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  ilike,
  lt,
  not,
  or,
  sql,
  type SQL,
} from 'drizzle-orm'

import {
  activeClipping,
  booksForUser,
  containsPattern,
  matchedBook,
  sourceFromEnum,
} from '../clippings/queries'
import { getDatabase } from '../db'
import { clippings } from '../db/schema'
import { assertFound } from '../errors'

/**
 * Read models for the MCP tools. Every query is scoped to one reader's own,
 * non-deleted clippings (`createdBy = userId`): the MCP server never reaches
 * another reader's data, public or not.
 */

const db = () => getDatabase().db
const own = (userId: number) =>
  and(eq(clippings.createdBy, userId), activeClipping)

export type ClippingSource = 'kindle' | 'weread' | 'unknown'
export type Granularity = 'day' | 'month' | 'year'

const PERIOD_FORMAT: Record<Granularity, string> = {
  day: 'YYYY-MM-DD',
  month: 'YYYY-MM',
  year: 'YYYY',
}

/**
 * A clipping's creation time bucketed in UTC, the zone the reports use. The
 * format is inlined, not bound: Postgres only matches the select expression to
 * the GROUP BY one when they are textually identical, and two bind parameters
 * never are.
 */
const period = (granularity: Granularity) =>
  sql<string>`to_char(${clippings.createdAt} at time zone 'UTC', ${sql.raw(`'${PERIOD_FORMAT[granularity]}'`)})`

export interface ClippingFilter {
  query?: string
  doubanId?: string
  bookTitle?: string
  source?: ClippingSource
  visibility?: 'all' | 'public' | 'private'
  from?: Date
  to?: Date
}

function filterConditions(userId: number, filter: ClippingFilter) {
  const conditions: (SQL | undefined)[] = [own(userId)]
  if (filter.query) {
    const pattern = containsPattern(filter.query)
    conditions.push(
      or(ilike(clippings.content, pattern), ilike(clippings.title, pattern))
    )
  }
  if (filter.doubanId) conditions.push(eq(clippings.bookId, filter.doubanId))
  if (filter.bookTitle)
    conditions.push(ilike(clippings.title, containsPattern(filter.bookTitle)))
  if (filter.source)
    conditions.push(eq(clippings.source, sourceFromEnum(filter.source)))
  if (filter.visibility === 'public')
    conditions.push(eq(clippings.visible, true))
  if (filter.visibility === 'private')
    conditions.push(eq(clippings.visible, false))
  if (filter.from) conditions.push(gte(clippings.createdAt, filter.from))
  if (filter.to) conditions.push(lt(clippings.createdAt, filter.to))
  return conditions
}

/** Keyset cursor over (createdAt, id); opaque to clients. */
interface Cursor {
  at: Date
  id: number
}

export function encodeCursor(cursor: Cursor) {
  return Buffer.from(`${cursor.at.toISOString()}|${cursor.id}`).toString(
    'base64url'
  )
}

export function decodeCursor(value: string): Cursor | null {
  const [at, id] = Buffer.from(value, 'base64url').toString().split('|')
  const cursor = { at: new Date(at), id: Number(id) }
  return Number.isNaN(cursor.at.getTime()) || !Number.isSafeInteger(cursor.id)
    ? null
    : cursor
}

export type ClippingRow = typeof clippings.$inferSelect

export async function searchClippings(
  userId: number,
  filter: ClippingFilter,
  options: { order: 'newest' | 'oldest'; limit: number; cursor?: Cursor | null }
) {
  const conditions = filterConditions(userId, filter)
  const newest = options.order === 'newest'
  const [{ total }] = await db()
    .select({ total: count() })
    .from(clippings)
    .where(and(...conditions))
  const { cursor } = options
  const after = cursor
    ? newest
      ? or(
          lt(clippings.createdAt, cursor.at),
          and(eq(clippings.createdAt, cursor.at), lt(clippings.id, cursor.id))
        )
      : or(
          gt(clippings.createdAt, cursor.at),
          and(eq(clippings.createdAt, cursor.at), gt(clippings.id, cursor.id))
        )
    : undefined
  const direction = newest ? desc : asc
  // One extra row tells whether another page exists.
  const rows = await db()
    .select()
    .from(clippings)
    .where(and(...conditions, after))
    .orderBy(direction(clippings.createdAt), direction(clippings.id))
    .limit(options.limit + 1)
  const items = rows.slice(0, options.limit)
  const last = items.at(-1)
  return {
    total,
    items,
    nextCursor:
      rows.length > options.limit && last
        ? encodeCursor({ at: last.createdAt, id: last.id })
        : null,
  }
}

export async function ownClipping(userId: number, id: number) {
  return assertFound(
    await db().query.clippings.findFirst({
      where: and(eq(clippings.id, id), own(userId)),
    }),
    'clipping not found'
  )
}

export async function profile(userId: number) {
  const user = assertFound(
    await db().query.users.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.id, userId), isNull(table.deletedAt)),
    }),
    'user not found'
  )
  const [stats] = await db()
    .select({
      clippingsCount: count(clippings.id),
      booksCount: countDistinct(
        sql`case when ${matchedBook} then ${clippings.bookId} end`
      ),
      firstClippingAt: sql<Date | null>`min(${clippings.createdAt})`,
      lastClippingAt: sql<Date | null>`max(${clippings.createdAt})`,
    })
    .from(clippings)
    .where(own(userId))
  return { user, ...stats }
}

export function listBooks(
  userId: number,
  pagination: { limit: number; offset: number }
) {
  return booksForUser(userId, pagination, userId)
}

/** Clippings that never matched a Douban book, grouped by their Kindle title. */
export async function listUnmatchedBooks(
  userId: number,
  pagination: { limit: number; offset: number }
) {
  return db()
    .select({
      title: clippings.title,
      clippingsCount: count(clippings.id),
      startReadingAt: sql<Date>`min(${clippings.createdAt})`,
      lastReadingAt: sql<Date>`max(${clippings.createdAt})`,
    })
    .from(clippings)
    .where(and(own(userId), not(matchedBook)))
    .groupBy(clippings.title)
    .orderBy(desc(sql`max(${clippings.createdAt})`))
    .limit(pagination.limit)
    .offset(pagination.offset)
}

export async function bookReading(userId: number, doubanId: string) {
  const [row] = await db()
    .select({
      clippingsCount: count(clippings.id),
      startReadingAt: sql<Date | null>`min(${clippings.createdAt})`,
      lastReadingAt: sql<Date | null>`max(${clippings.createdAt})`,
      kindleTitle: sql<string | null>`min(${clippings.title})`,
    })
    .from(clippings)
    .where(and(own(userId), eq(clippings.bookId, doubanId)))
  return row
}

const yearRange = (year: number) => ({
  from: new Date(Date.UTC(year, 0, 1)),
  to: new Date(Date.UTC(year + 1, 0, 1)),
})

export async function yearlyReport(userId: number, year: number) {
  const { from, to } = yearRange(year)
  const inYear = and(
    own(userId),
    gte(clippings.createdAt, from),
    lt(clippings.createdAt, to)
  )
  const [books, months, [busiestDay]] = await Promise.all([
    db()
      .select({
        doubanId: clippings.bookId,
        kindleTitle: sql<string>`min(${clippings.title})`,
        clippingsCount: count(clippings.id),
        startReadingAt: sql<Date>`min(${clippings.createdAt})`,
        lastReadingAt: sql<Date>`max(${clippings.createdAt})`,
      })
      .from(clippings)
      .where(inYear)
      .groupBy(clippings.bookId)
      .orderBy(desc(count(clippings.id))),
    db()
      .select({ period: period('month'), count: count(clippings.id) })
      .from(clippings)
      .where(inYear)
      .groupBy(period('month')),
    db()
      .select({ period: period('day'), count: count(clippings.id) })
      .from(clippings)
      .where(inYear)
      .groupBy(period('day'))
      .orderBy(desc(count(clippings.id)), asc(period('day')))
      .limit(1),
  ])
  return { books, months, busiestDay: busiestDay ?? null }
}

export async function readingStats(
  userId: number,
  granularity: Granularity,
  range: { from?: Date; to?: Date }
) {
  const where = and(
    own(userId),
    range.from ? gte(clippings.createdAt, range.from) : undefined,
    range.to ? lt(clippings.createdAt, range.to) : undefined
  )
  const [buckets, years] = await Promise.all([
    db()
      .select({ period: period(granularity), count: count(clippings.id) })
      .from(clippings)
      .where(where)
      .groupBy(period(granularity))
      .orderBy(asc(period(granularity))),
    db()
      .selectDistinct({ year: period('year') })
      .from(clippings)
      .where(own(userId))
      .orderBy(asc(period('year'))),
  ])
  return { buckets, years: years.map((row) => Number(row.year)) }
}
