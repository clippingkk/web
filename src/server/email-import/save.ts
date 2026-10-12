import { and, desc, eq } from 'drizzle-orm'

import { wenquRequest, type WenquSearchResponse } from '@/services/wenqu'

import { clippingDataId, insertClippings } from '../clippings/create'
import { matchedBook } from '../clippings/queries'
import { getDatabase } from '../db'
import { clippings, readerNotes } from '../db/schema'
import type { KindleNotebook } from './kindle-notebook'
import { log } from './log'

/**
 * Saves a parsed notebook to a verified reader's library: highlights as
 * clippings, notes to `reader_notes`.
 */

/** Keeps an insert well under Postgres' 65,535 bind parameters. */
const INSERT_CHUNK = 200
const KINDLE = 1

const db = () => getDatabase().db

/**
 * Highlights compare equal across the .txt and HTML exports when their text
 * does: the two disagree on whitespace and on how locations are written.
 */
function sameText(content: string) {
  return content
    .replace(/\s+/g, '')
    .replace(/^[，,。！@【】—]+|[，,。！@【】—]+$/g, '')
}

/** A title with case, spacing and punctuation folded away, for matching. */
function bookKey(title: string) {
  return title
    .split(/[(（]/)[0]
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
}

async function resolveBookId(userId: number, title: string) {
  const [known] = await db()
    .select({ bookId: clippings.bookId })
    .from(clippings)
    .where(
      and(
        eq(clippings.createdBy, userId),
        eq(clippings.title, title),
        matchedBook
      )
    )
    .orderBy(desc(clippings.id))
    .limit(1)
  if (known) return known.bookId
  try {
    const result = await wenquRequest<WenquSearchResponse>(
      `/books/search?query=${encodeURIComponent(title)}&limit=50&offset=0`,
      { signal: AbortSignal.timeout(8_000) }
    )
    // A loose search can rank another book first; leaving the clippings
    // unmatched (fixable from the book page) beats filing them wrongly.
    const wanted = bookKey(title)
    const match = result.books.find((book) =>
      [book.title, book.originTitle].some((name) => {
        const key = bookKey(name ?? '')
        // Kindle titles often carry a subtitle Douban files separately.
        const [short, long] =
          key.length < wanted.length ? [key, wanted] : [wanted, key]
        return short.length >= 2 && long.includes(short)
      })
    )
    return match ? String(match.doubanId) : '0'
  } catch (error) {
    // Unmatched clippings can still be matched from the book page later.
    log('WARN', 'Wenqu book search failed', {
      'book.title': title.slice(0, 200),
      'error.message': error instanceof Error ? error.message : String(error),
    })
    return '0'
  }
}

/**
 * Not one transaction: if the job dies between the clippings and the notes,
 * its retry skips the clippings already saved and adds the notes.
 */
export async function saveNotebook(
  userId: number,
  notebook: KindleNotebook,
  receivedAt: number
) {
  const { title } = notebook
  const bookId = await resolveBookId(userId, title)
  // Deleted rows count too, so re-sending an export doesn't revive them.
  const existing = await db()
    .select({
      id: clippings.id,
      content: clippings.content,
      deletedAt: clippings.deletedAt,
    })
    .from(clippings)
    .where(and(eq(clippings.createdBy, userId), eq(clippings.title, title)))
  // Matching on text alone also folds two identical highlights on different
  // pages into one: rare, and the price of not doubling every .txt import.
  const seen = new Set(existing.map((row) => sameText(row.content)))

  const drafts = notebook.highlights.flatMap((highlight, index) => {
    const key = sameText(highlight.content)
    if (seen.has(key)) return []
    seen.add(key)
    return [
      {
        title,
        content: highlight.content,
        bookId,
        pageAt: highlight.pageAt,
        // One timestamp per email; the offset keeps the export's order.
        createdAt: new Date(receivedAt + index),
        source: KINDLE,
      },
    ]
  })
  // Notes link to live clippings: the ones already there and the new ones.
  const idByText = new Map(
    existing
      .filter((row) => !row.deletedAt)
      .map((row) => [sameText(row.content), row.id])
  )
  let created = 0
  for (let i = 0; i < drafts.length; i += INSERT_CHUNK) {
    const rows = await insertClippings(
      userId,
      drafts.slice(i, i + INSERT_CHUNK),
      { visible: true }
    )
    created += rows.length
    for (const row of rows) idByText.set(sameText(row.content), row.id)
  }

  let notes = 0
  if (notebook.notes.length) {
    const rows = notebook.notes.map((note, index) => ({
      userId,
      clippingId:
        note.highlight === null
          ? null
          : (idByText.get(
              sameText(notebook.highlights[note.highlight].content)
            ) ?? null),
      title,
      pageAt: note.pageAt,
      content: note.content,
      // The same note typed twice at one spot is kept once.
      dataId: clippingDataId(userId, note.content, note.pageAt),
      createdAt: new Date(receivedAt + index),
    }))
    for (let i = 0; i < rows.length; i += INSERT_CHUNK)
      notes += (
        await db()
          .insert(readerNotes)
          .values(rows.slice(i, i + INSERT_CHUNK))
          .onConflictDoNothing()
          .returning({ id: readerNotes.id })
      ).length
  }

  return { created, notes }
}
