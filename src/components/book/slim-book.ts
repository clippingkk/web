import type { WenquBook } from '@/services/wenqu'

/**
 * Only what a cover or book card draws. Wenqu records carry long summaries
 * and author bios that would otherwise be serialized into the page when a
 * server component hands the record to a client component.
 */
export function slimBook(book?: WenquBook | null): WenquBook | undefined {
  if (!book) return undefined
  return { ...book, summary: '', authorIntro: '', tags: [] }
}
