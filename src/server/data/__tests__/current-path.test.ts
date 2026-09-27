import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: vi.fn() }))

import { dashSubpath } from '../current-path'

describe('dashSubpath', () => {
  it('splits the section and the search off the user segment', () => {
    expect(
      dashSubpath('/dash/reader/settings/orders?tab=2', 'reader', 'x')
    ).toEqual({
      subpath: 'settings/orders',
      search: '?tab=2',
    })
  })

  it('lines up non-ASCII slugs whether or not the param is encoded', () => {
    const path = `/dash/${encodeURIComponent('读者')}/settings/exports`
    expect(dashSubpath(path, '读者', 'x').subpath).toBe('settings/exports')
    expect(dashSubpath(path, encodeURIComponent('读者'), 'x').subpath).toBe(
      'settings/exports'
    )
  })

  it('falls back instead of throwing on a malformed escape', () => {
    expect(dashSubpath('/dash/50%/settings/web', '50%', 'x').subpath).toBe(
      'settings/web'
    )
    expect(dashSubpath('/dash/a%zz/settings', 'other', 'fallback')).toEqual({
      subpath: 'fallback',
      search: '',
    })
  })

  it('falls back when the path belongs to another user', () => {
    expect(
      dashSubpath('/dash/else/settings/web', 'reader', 'settings/web')
    ).toEqual({ subpath: 'settings/web', search: '' })
  })
})
