import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  bookHref,
  clippingHref,
  dashHref,
  getMyHomeLink,
  getUserSlug,
  isUsableDomain,
} from '@/utils/profile.utils'

const mocks = vi.hoisted(() => ({
  serverQuery: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
  redirect: vi.fn(),
}))
vi.mock('../query', () => ({ serverQuery: mocks.serverQuery }))
vi.mock('../viewer', () => ({ getViewer: vi.fn() }))

import { isSameUser, parseUserParam, resolvePathUser } from '../path-user'

/** A tiny user table behind `me(id|domain)`: misses resolve to null, as serverQuery does with notFound: 'null'. */
function users(rows: { id: number; domain: string }[]) {
  mocks.serverQuery.mockImplementation(
    async (_doc, variables: { id?: number; domain?: string }) => {
      const me = rows.find((row) =>
        variables.id !== undefined
          ? row.id === variables.id
          : row.domain === variables.domain
      )
      return me ? { me } : null
    }
  )
}

beforeEach(() => {
  mocks.serverQuery.mockReset()
  mocks.notFound.mockClear()
})

describe('parseUserParam', () => {
  it.each([
    ['42', { id: 42 }],
    ['2147483647', { id: 2147483647 }],
    ['annatarhe', { domain: 'annatarhe' }],
    ['AnnatarHe', { domain: 'annatarhe' }],
    ['annatar.he', { domain: 'annatar.he' }],
    ['%E4%B8%AD%E6%96%87', { domain: '中文' }],
    ['100%', { domain: '100%' }],
    // `me(id: 0)` means "the signed-in reader"; too-large ids are not Ints.
    ['0', { domain: '0' }],
    ['2147483648', { domain: '2147483648' }],
    ['-1', { domain: '-1' }],
  ])('%s -> %j', (param, expected) => {
    expect(parseUserParam(param)).toEqual(expected)
  })
})

describe('resolvePathUser', () => {
  it('resolves an id', async () => {
    users([{ id: 42, domain: 'annatarhe' }])
    await expect(resolvePathUser('42')).resolves.toMatchObject({ id: 42 })
    expect(mocks.serverQuery).toHaveBeenCalledOnce()
    expect(mocks.serverQuery.mock.calls[0][1]).toEqual({ id: 42 })
    expect(mocks.serverQuery.mock.calls[0][2]).toEqual({ notFound: 'null' })
  })

  it('resolves a domain case-insensitively', async () => {
    users([{ id: 42, domain: 'annatarhe' }])
    await expect(resolvePathUser('AnnatarHe')).resolves.toMatchObject({
      id: 42,
    })
    expect(mocks.serverQuery.mock.calls[0][1]).toEqual({ domain: 'annatarhe' })
  })

  it('retries a legacy mixed-case domain as written', async () => {
    users([{ id: 7, domain: 'OldName' }])
    await expect(resolvePathUser('OldName')).resolves.toMatchObject({ id: 7 })
  })

  it('prefers the id when a legacy numeric domain collides with it', async () => {
    users([
      { id: 12345, domain: 'someone' },
      { id: 5, domain: '12345' },
    ])
    await expect(resolvePathUser('12345')).resolves.toMatchObject({
      id: 12345,
    })
  })

  it('falls back to a legacy numeric domain when no user has that id', async () => {
    users([{ id: 5, domain: '12345' }])
    await expect(resolvePathUser('12345')).resolves.toMatchObject({ id: 5 })
    expect(mocks.serverQuery.mock.calls.map((call) => call[1])).toEqual([
      { id: 12345 },
      { domain: '12345' },
    ])
  })

  it('never asks for `me` without an id or domain', async () => {
    users([])
    await expect(resolvePathUser('%20')).rejects.toThrow('NEXT_NOT_FOUND')
    for (const [, variables] of mocks.serverQuery.mock.calls)
      expect(variables.id ?? variables.domain).toBeTruthy()
  })

  it('renders not-found for an unknown user', async () => {
    users([{ id: 1, domain: 'someone' }])
    await expect(resolvePathUser('nobody')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(resolvePathUser('999')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})

describe('isSameUser', () => {
  const user = { id: 42, domain: 'annatarhe' }

  it.each(['42', 'annatarhe', 'AnnatarHe', 'annatar%68e'])(
    'matches %s',
    (param) => expect(isSameUser(param, user)).toBe(true)
  )

  it.each(['43', 'someone', '042x', ''])('does not match %s', (param) =>
    expect(isSameUser(param, user)).toBe(false)
  )

  it('compares all-digit params by id only', () => {
    expect(isSameUser('12345', { id: 5, domain: '12345' })).toBe(false)
    expect(isSameUser('5', { id: 5, domain: '12345' })).toBe(true)
  })

  it('never matches a user without a domain by an empty domain', () => {
    expect(isSameUser('x', { id: 1, domain: '' })).toBe(false)
    expect(isSameUser('x', { id: 1, domain: null })).toBe(false)
  })
})

describe('slug rule', () => {
  it.each(['abc', 'annatarhe', 'a-b', 'user-2024', '9lives', 'A'.repeat(32)])(
    'uses %s as a slug',
    (domain) => {
      expect(isUsableDomain(domain)).toBe(true)
      expect(getUserSlug({ id: 1, domain })).toBe(domain)
    }
  )

  it.each([
    '',
    null,
    undefined,
    'ab',
    '123',
    '0042',
    '-abc',
    'annatar.he',
    'has space',
    'a'.repeat(33),
    'ünïcode',
  ])('falls back to the id for %j', (domain) => {
    expect(isUsableDomain(domain)).toBe(false)
    expect(getUserSlug({ id: 7, domain })).toBe('7')
  })
})

describe('href helpers', () => {
  const user = { id: 42, domain: 'annatarhe' }
  const legacy = { id: 7, domain: '12345' }

  it('builds dashboard links from a user or a slug', () => {
    expect(dashHref(user, 'home')).toBe('/dash/annatarhe/home')
    expect(dashHref(legacy, 'settings/web')).toBe('/dash/7/settings/web')
    expect(dashHref(42, 'upload')).toBe('/dash/42/upload')
    expect(dashHref('annatarhe')).toBe('/dash/annatarhe/home')
  })

  it('builds clipping links, with the in-app channel when given', () => {
    expect(clippingHref(user, 9)).toBe('/dash/annatarhe/clippings/9')
    expect(clippingHref(legacy, 9, 1)).toBe('/dash/7/clippings/9?iac=1')
    expect(clippingHref('someone', '9', 0)).toBe(
      '/dash/someone/clippings/9?iac=0'
    )
  })

  it('builds book links', () => {
    expect(bookHref(user, '26340138')).toBe('/dash/annatarhe/book/26340138')
    expect(bookHref(7, '1')).toBe('/dash/7/book/1')
  })

  it('never lets a raw slug escape its segment', () => {
    expect(dashHref('../admin', 'home')).toBe('/dash/..%2Fadmin/home')
  })

  it('sends a signed-out reader home through sign-in', () => {
    expect(getMyHomeLink(user)).toBe('/dash/annatarhe/home')
    expect(getMyHomeLink()).toBe('/auth')
    expect(getMyHomeLink(undefined, '/pricing')).toBe(
      `/auth?next=${encodeURIComponent('/pricing')}`
    )
  })
})
