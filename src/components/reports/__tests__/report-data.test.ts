import { describe, expect, it } from 'vitest'

import {
  pickReportQuotes,
  rankReportBooks,
  type ReportBookData,
  type ReportClipping,
  reportYears,
  totalHighlights,
} from '../report-data'

function book(doubanId: string, clippingsCount: number): ReportBookData {
  return { doubanId, clippingsCount, clippings: [] }
}

function clipping(
  id: number,
  createdAt: string,
  content = 'A passage'
): ReportClipping {
  return { id, content, title: 'Book', pageAt: '1', createdAt }
}

describe('reportYears', () => {
  it('lists every year of the account, newest first', () => {
    expect(reportYears('2023-05-01T00:00:00.000Z', 2025, 2026)).toEqual([
      2026, 2025, 2024, 2023,
    ])
  })

  it('keeps a requested year that predates the account date', () => {
    expect(reportYears('2025-01-01T00:00:00.000Z', 2024, 2026)).toEqual([
      2026, 2025, 2024,
    ])
  })

  it('accepts epoch milliseconds and falls back when the date is missing', () => {
    expect(reportYears(String(Date.UTC(2025, 6, 1)), 2026, 2026)).toEqual([
      2026, 2025,
    ])
    expect(reportYears(null, 2026, 2026).at(-1)).toBe(2018)
  })
})

describe('rankReportBooks', () => {
  it('drops unmatched rows and ranks by highlights', () => {
    const books = [book('', 9), book('1084336', 2), book('4913064', 5)]
    expect(rankReportBooks(books).map((b) => b.doubanId)).toEqual([
      '4913064',
      '1084336',
    ])
    expect(totalHighlights(books)).toBe(16)
  })
})

describe('pickReportQuotes', () => {
  it("puts the report year's passages first and skips empty ones", () => {
    const quotes = pickReportQuotes(
      [
        clipping(1, '2024-03-01T00:00:00.000Z'),
        clipping(2, '2025-03-01T00:00:00.000Z', '   '),
        clipping(3, '2025-04-01T00:00:00.000Z'),
        clipping(4, '2025-05-01T00:00:00.000Z'),
      ],
      2025,
      2
    )
    expect(quotes.map((c) => c.id)).toEqual([3, 4])
  })
})
