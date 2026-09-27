import { describe, expect, it } from 'vitest'

import { formatDate } from '../format-date'

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
