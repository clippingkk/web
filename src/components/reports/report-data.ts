import type { FetchYearlyReportQuery } from '@/gql/graphql'
import { isValidDoubanId } from '@/services/wenqu'

export type YearlyReport = FetchYearlyReportQuery['reportYearly']
export type ReportBookData = YearlyReport['books'][number]
export type ReportClipping = ReportBookData['clippings'][number]

/** The oldest year the switcher offers when an account date is missing. */
const FIRST_YEAR = 2018

function utcYear(value?: string | null) {
  if (!value) return null
  const date = new Date(/^\d+$/.test(value) ? Number(value) : value)
  return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear()
}

/**
 * Every year from the account's first to `now`, newest first. The report's
 * own year is always included, even when it predates the account.
 */
export function reportYears(
  createdAt: string | null | undefined,
  year: number,
  now: number
): number[] {
  const first = Math.min(utcYear(createdAt) ?? FIRST_YEAR, year, now)
  const years: number[] = []
  for (let y = Math.max(now, year); y >= first; y--) years.push(y)
  return years
}

/** Books that resolve to a real title, most-highlighted first. */
export function rankReportBooks(
  books: readonly ReportBookData[]
): ReportBookData[] {
  return books
    .filter((b) => isValidDoubanId(b.doubanId))
    .toSorted((a, b) => b.clippingsCount - a.clippingsCount)
}

export function totalHighlights(books: readonly ReportBookData[]) {
  return books.reduce((sum, b) => sum + b.clippingsCount, 0)
}

/**
 * A few passages for a book's section. `clippings` spans every year the
 * reader spent with the book, so the report's year comes first.
 */
export function pickReportQuotes(
  clippings: readonly ReportClipping[],
  year: number,
  count: number
): ReportClipping[] {
  const readable = clippings.filter((c) => c.content.trim().length > 0)
  const thisYear = readable.filter((c) => utcYear(c.createdAt) === year)
  const others = readable.filter((c) => utcYear(c.createdAt) !== year)
  return [...thisYear, ...others].slice(0, count)
}
