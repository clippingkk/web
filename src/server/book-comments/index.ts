import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  lt,
} from 'drizzle-orm'

import { activeClipping, clippingVisibleTo, page } from '../clippings/queries'
import { getDatabase } from '../db'
import { bookComments, clippings, users, type BookComment } from '../db/schema'
import { ApiError, assertFound } from '../errors'
import { canAdmin } from '../gate/authz'
import { rateLimit } from '../redis'

/**
 * Book comments: one discussion per book, keyed by its Douban id and shown on
 * every reader's page for that book. See docs/book-comments.md.
 */

export const BOOK_COMMENT_MIN_LENGTH = 40
export const BOOK_COMMENT_MAX_LENGTH = 5000
/** Comments one reader may post per hour, across all books. */
export const BOOK_COMMENTS_PER_HOUR = 20

/** A row as the GraphQL `BookComment` resolvers receive it. */
export type BookCommentRow = BookComment & {
  /** Filled in for whole pages at once; resolved lazily otherwise. */
  creatorClippingsCount?: number
}

// A matched book: a Douban id, never the '' or '0' of unmatched highlights.
const DOUBAN_ID = /^[1-9]\d{0,19}$/

const db = () => getDatabase().db

const activeBookComment = isNull(bookComments.deletedAt)

export function isDoubanId(value: unknown): value is string {
  return typeof value === 'string' && DOUBAN_ID.test(value)
}

/** Comments by accounts that still exist, on one book. */
function listed(doubanId: string) {
  return and(
    eq(bookComments.bookId, doubanId),
    activeBookComment,
    isNull(users.deletedAt)
  )
}

/**
 * How many of each creator's highlights in this book the viewer may see, so a
 * private library never shows through the badge.
 */
export async function creatorClippingCounts(
  doubanId: string,
  creatorIds: number[],
  viewerId: number
) {
  const counts = new Map<number, number>()
  if (!creatorIds.length) return counts
  const rows = await db()
    .select({ createdBy: clippings.createdBy, value: count() })
    .from(clippings)
    .where(
      and(
        eq(clippings.bookId, doubanId),
        inArray(clippings.createdBy, [...new Set(creatorIds)]),
        activeClipping,
        clippingVisibleTo(viewerId)
      )
    )
    .groupBy(clippings.createdBy)
  for (const row of rows) counts.set(row.createdBy, row.value)
  return counts
}

export async function creatorClippingsCount(
  comment: BookComment,
  viewerId: number
) {
  const counts = await creatorClippingCounts(
    comment.bookId,
    [comment.createdBy],
    viewerId
  )
  return counts.get(comment.createdBy) ?? 0
}

/** A book's discussion, newest first, paged by `lastId`. */
export async function bookCommentPage(
  doubanId: unknown,
  pagination: { limit?: number; lastId?: number | null } | undefined,
  viewerId: number
): Promise<{ count: number; items: BookCommentRow[] }> {
  if (!isDoubanId(doubanId)) return { count: 0, items: [] }
  const { limit, lastId } = page(pagination)
  const [[total], items] = await Promise.all([
    db()
      .select({ value: count() })
      .from(bookComments)
      .innerJoin(users, eq(users.id, bookComments.createdBy))
      .where(listed(doubanId)),
    db()
      .select(getTableColumns(bookComments))
      .from(bookComments)
      .innerJoin(users, eq(users.id, bookComments.createdBy))
      .where(and(listed(doubanId), lt(bookComments.id, lastId)))
      .orderBy(desc(bookComments.id))
      .limit(limit),
  ])
  const counts = await creatorClippingCounts(
    doubanId,
    items.map((item) => item.createdBy),
    viewerId
  )
  return {
    count: total.value,
    items: items.map((item) => ({
      ...item,
      creatorClippingsCount: counts.get(item.createdBy) ?? 0,
    })),
  }
}

/**
 * Posts a comment. The book must have a highlight the reader can see (their
 * own, or someone's public one), so posting cannot confirm that a book exists
 * only in someone else's private library.
 */
export async function createBookComment(
  userId: number,
  doubanId: unknown,
  content: unknown
): Promise<BookCommentRow> {
  if (!isDoubanId(doubanId))
    throw new ApiError('book not found', 404, 'NOT_FOUND')
  const text = String(content ?? '').trim()
  if (text.length < BOOK_COMMENT_MIN_LENGTH)
    throw new ApiError(
      `Write at least ${BOOK_COMMENT_MIN_LENGTH} characters.`,
      400
    )
  if (text.length > BOOK_COMMENT_MAX_LENGTH)
    throw new ApiError(
      `Keep it under ${BOOK_COMMENT_MAX_LENGTH.toLocaleString('en')} characters.`,
      400
    )
  const [visible] = await db()
    .select({ id: clippings.id })
    .from(clippings)
    .where(
      and(
        eq(clippings.bookId, doubanId),
        activeClipping,
        clippingVisibleTo(userId)
      )
    )
    .limit(1)
  assertFound(visible, 'book not found')

  const { allowed } = await rateLimit(
    `ck:book-comment:${userId}`,
    BOOK_COMMENTS_PER_HOUR,
    3600
  )
  if (!allowed)
    throw new ApiError(
      'You have posted a lot of comments in the last hour. Try again later.',
      429
    )

  const [created] = await db()
    .insert(bookComments)
    .values({ bookId: doubanId, createdBy: userId, content: text })
    .returning()
  return {
    ...created,
    creatorClippingsCount: await creatorClippingsCount(created, userId),
  }
}

/** Soft-deletes a comment. Its author or an administrator may. */
export async function deleteBookComment(userId: number, id: number) {
  const comment = assertFound(
    await db().query.bookComments.findFirst({
      where: and(eq(bookComments.id, id), activeBookComment),
    }),
    'comment not found'
  )
  if (comment.createdBy !== userId && !(await canAdmin(userId)))
    throw new ApiError('Forbidden', 403)
  const now = new Date()
  await db()
    .update(bookComments)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(bookComments.id, id))
  return true
}
