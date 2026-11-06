import { and, count, desc, eq, isNull, max } from 'drizzle-orm'

import {
  recommendationsSchema,
  type Recommendations,
  type RecommendationsContext,
} from '@/lib/ai/schemas'
import { shortBookTitle } from '@/lib/book-match'

import { getDatabase } from '../db'
import { clippings } from '../db/schema'
import { ApiError } from '../errors'
import { loadBooks } from './book-facts'
import { clipChars, evenIndexes } from './book-highlights'
import { outputLanguage } from './language'
import {
  promptVersions,
  recommendationsPrompt,
  type ShelfPromptBook,
} from './prompts'
import { fingerprintOf, resultStream, type ResultTask } from './results'

const SHELF_BOOKS = 12
const LIBRARY_TITLES = 150
const HIGHLIGHTS_PER_BOOK = 3
const HIGHLIGHT_CHARS = 180
/** Highlights read per shelf book, newest first, before spreading down to a few. */
const HIGHLIGHTS_SCANNED = 60

type ShelfRow = { bookId: string; title: string; highlightCount: number }

/** The reader's books, most recently highlighted first. Unmatched books share id '0', so titles keep them apart. */
async function loadLibrary(userId: number): Promise<ShelfRow[]> {
  return getDatabase()
    .db.select({
      bookId: clippings.bookId,
      title: clippings.title,
      highlightCount: count(),
    })
    .from(clippings)
    .where(and(eq(clippings.createdBy, userId), isNull(clippings.deletedAt)))
    .groupBy(clippings.bookId, clippings.title)
    .orderBy(desc(max(clippings.id)))
    .limit(LIBRARY_TITLES)
}

async function loadShelfHighlights(userId: number, row: ShelfRow) {
  const kept = await getDatabase()
    .db.select({ content: clippings.content })
    .from(clippings)
    .where(
      and(
        eq(clippings.createdBy, userId),
        eq(clippings.title, row.title),
        isNull(clippings.deletedAt)
      )
    )
    .orderBy(desc(clippings.id))
    .limit(HIGHLIGHTS_SCANNED)
  return evenIndexes(kept.length, HIGHLIGHTS_PER_BOOK).map((index) =>
    clipChars(kept[index].content.trim(), HIGHLIGHT_CHARS)
  )
}

async function buildShelf(
  userId: number,
  rows: ShelfRow[]
): Promise<ShelfPromptBook[]> {
  const [books, highlights] = await Promise.all([
    loadBooks(rows.map(({ bookId }) => bookId)),
    Promise.all(rows.map((row) => loadShelfHighlights(userId, row))),
  ])
  return rows.map((row, index) => {
    const book = books.get(row.bookId)
    return {
      ref: index + 1,
      title: clipChars(shortBookTitle(book?.title || row.title), 200),
      author: book?.author || undefined,
      tags: book?.tags?.slice(0, 5),
      highlightCount: row.highlightCount,
      highlights: highlights[index],
    }
  })
}

export async function streamRecommendations(
  userId: number,
  input: { language?: string; force: boolean },
  run: { threadId: string; runId: string },
  signal: AbortSignal
) {
  const library = await loadLibrary(userId)
  if (library.length === 0)
    throw new ApiError(
      'Import some highlights to get recommendations.',
      404,
      'NOT_FOUND'
    )
  const language = outputLanguage(input.language)
  const recent = library.slice(0, SHELF_BOOKS)
  const task: ResultTask<typeof recommendationsSchema, RecommendationsContext> =
    {
      useCase: 'recommendations',
      key: `ai:recommendations:v2:${userId}:${language.tag}`,
      schema: recommendationsSchema,
      // Only a new book changes the list. Another highlight in the same book keeps it.
      fingerprint: fingerprintOf(
        promptVersions.recommendations,
        recent.map(({ title }) => title).toSorted()
      ),
      force: input.force,
      signal,
      attributes: { 'user.id': userId, 'shelf.books': recent.length },
      prepare: async (previous: Recommendations | null) => {
        const shelf = await buildShelf(userId, recent)
        return {
          prompt: recommendationsPrompt(language.name, {
            shelf,
            alreadyRead: library.map(({ title }) =>
              clipChars(shortBookTitle(title), 120)
            ),
            // Asking again should bring new books, not the same five reworded.
            avoid: previous?.picks.map(({ title }) => title) ?? [],
          }),
          context: {
            shelf: shelf.map(({ ref, title }, index) => ({
              ref,
              title,
              bookId: recent[index].bookId,
            })),
          },
        }
      },
    }
  return resultStream(task, run)
}
