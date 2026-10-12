import { describe, expect, it } from 'vitest'

import { formatDate, formatDateTime } from '../format-date'

describe('formatDate', () => {
  it('formats in UTC so server and client agree', () => {
    expect(formatDate('2026-03-01T23:30:00Z', 'en')).toBe('Mar 1, 2026')
  })

  it('uses the UI language', () => {
    expect(formatDate('2026-03-01T00:00:00Z', 'zh')).toContain('2026')
    expect(formatDate('2026-03-01T00:00:00Z', 'zh')).toContain('3')
  })

  it('returns an empty string for missing or invalid dates', () => {
    expect(formatDate(null, 'en')).toBe('')
    expect(formatDate('not a date', 'en')).toBe('')
  })
})

describe('formatDateTime', () => {
  it('shows the time in UTC and says so', () => {
    expect(formatDateTime('2026-10-12T08:05:00Z', 'en')).toMatch(
      /^Oct 12, 2026, 8:05\sAM UTC$/
    )
  })

  it('uses the UI language', () => {
    expect(formatDateTime('2026-10-12T08:05:00Z', 'zh')).toContain('2026')
  })

  it('returns an empty string for missing or invalid dates', () => {
    expect(formatDateTime(null, 'en')).toBe('')
    expect(formatDateTime('not a date', 'en')).toBe('')
  })
})
