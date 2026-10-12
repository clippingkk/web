import { and, count, desc, eq } from 'drizzle-orm'

import { activeClipping } from '../clippings/queries'
import { getDatabase } from '../db'
import { clippings, readerNotes } from '../db/schema'

/** Notes a reader typed in Kindle, imported with their notebook exports. */

export interface ReaderNoteSummary {
  id: number
  title: string
  pageAt: string
  content: string
  /** The highlight the note annotates, while that clipping still exists. */
  clippingId: number | null
  createdAt: string
}

/** The reader's newest notes, and how many they have in all. */
export async function listReaderNotes(userId: number, limit = 100) {
  const db = getDatabase().db
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: readerNotes.id,
        title: readerNotes.title,
        pageAt: readerNotes.pageAt,
        content: readerNotes.content,
        clippingId: clippings.id,
        createdAt: readerNotes.createdAt,
      })
      .from(readerNotes)
      .leftJoin(
        clippings,
        and(eq(clippings.id, readerNotes.clippingId), activeClipping)
      )
      .where(eq(readerNotes.userId, userId))
      .orderBy(desc(readerNotes.createdAt), desc(readerNotes.id))
      .limit(limit),
    db
      .select({ total: count() })
      .from(readerNotes)
      .where(eq(readerNotes.userId, userId)),
  ])
  return {
    total,
    notes: rows.map((row): ReaderNoteSummary => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
  }
}
