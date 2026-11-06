import { and, asc, eq, inArray, isNull } from 'drizzle-orm'

import {
  bookSummarySchema,
  type BookSummary,
  type BookSummaryContext,
} from '@/lib/ai/schemas'
import { shortBookTitle } from '@/lib/book-match'

import { getDatabase } from '../db'
import { clippings } from '../db/schema'
import { ApiError } from '../errors'
import { loadBooks } from './book-facts'
import {
  BOOK_SUMMARY_SAMPLE,
  clipChars,
  evenIndexes,
  highlightLanguage,
  sampleHighlights,
  type SampledHighlight,
} from './book-highlights'
import { bookSummaryPrompt, promptVersions } from './prompts'
import {
  fingerprintOf,
  resultStream,
  storedResult,
  type AIResult,
  type ResultTask,
} from './results'
import { logResultWarning } from './telemetry'

const USE_CASE = 'book_summary'

export type BookHighlightSource = {
  total: number
  title: string
  highlights: SampledHighlight[]
}

function cacheKey(userId: number, bookId: string) {
  return `ai:book-summary:v2:${userId}:${bookId}`
}

function fingerprintFor(highlights: readonly SampledHighlight[]) {
  return fingerprintOf(promptVersions.bookSummary, highlights)
}

/**
 * The reader's own highlights for one book, in reading order, already sampled
 * and trimmed. Deleted rows and anyone else's copy of the book are excluded.
 */
export async function loadBookHighlights(
  userId: number,
  bookId: string
): Promise<BookHighlightSource> {
  const where = and(
    eq(clippings.createdBy, userId),
    eq(clippings.bookId, bookId),
    isNull(clippings.deletedAt)
  )
  const rows = await getDatabase()
    .db.select({ id: clippings.id })
    .from(clippings)
    .where(where)
    .orderBy(asc(clippings.id))
  const picked = evenIndexes(rows.length, BOOK_SUMMARY_SAMPLE).map(
    (index) => rows[index]!.id
  )
  if (picked.length === 0) return { total: 0, title: '', highlights: [] }
  const contents = await getDatabase()
    .db.select({
      id: clippings.id,
      title: clippings.title,
      content: clippings.content,
    })
    .from(clippings)
    .where(and(where, inArray(clippings.id, picked)))
    .orderBy(asc(clippings.id))
  return {
    total: rows.length,
    title: contents[0]?.title ?? '',
    highlights: sampleHighlights(contents),
  }
}

/**
 * The summary already stored for this reader and book, when the highlights
 * have not changed. A page view uses this and does not call the model.
 */
export async function cachedBookSummary(
  userId: number,
  bookId: string
): Promise<AIResult<BookSummary, BookSummaryContext> | null> {
  try {
    const source = await loadBookHighlights(userId, bookId)
    if (source.highlights.length === 0) return null
    return await storedResult(
      USE_CASE,
      cacheKey(userId, bookId),
      bookSummarySchema,
      fingerprintFor(source.highlights)
    )
  } catch {
    logResultWarning('book summary cache lookup failed', USE_CASE)
    return null
  }
}

export async function streamBookSummary(
  userId: number,
  input: { bookId: string; force: boolean },
  run: { threadId: string; runId: string },
  signal: AbortSignal
) {
  const source = await loadBookHighlights(userId, input.bookId)
  if (source.highlights.length === 0)
    throw new ApiError(
      'This book has no highlights to summarize.',
      404,
      'NOT_FOUND'
    )
  const task: ResultTask<typeof bookSummarySchema, BookSummaryContext> = {
    useCase: USE_CASE,
    key: cacheKey(userId, input.bookId),
    schema: bookSummarySchema,
    fingerprint: fingerprintFor(source.highlights),
    force: input.force,
    signal,
    attributes: {
      'user.id': userId,
      'book.id': input.bookId,
      'highlights.count': source.total,
      'highlights.sampled': source.highlights.length,
    },
    prepare: async () => {
      const book = (await loadBooks([input.bookId])).get(input.bookId)
      return {
        prompt: bookSummaryPrompt(
          highlightLanguage(source.highlights.map(({ text }) => text)),
          {
            title: clipChars(shortBookTitle(book?.title || source.title), 300),
            author: clipChars(book?.author ?? '', 300),
            highlights: source.highlights.map(({ ref, text }) => ({
              ref,
              text,
            })),
          }
        ),
        context: { total: source.total, highlights: source.highlights },
      }
    },
  }
  return resultStream(task, run)
}
