// @vitest-environment node
import { beforeEach, expect, it } from 'vitest'

import { resetServerEnvForTests } from '../../env'
import { safeNext, assertSameOrigin, cookieValue } from '../security'
beforeEach(() => {
  process.env.DATABASE_URL = 'postgres://local/test'
  process.env.REDIS_URL = 'redis://localhost'
  process.env.APP_ORIGIN = 'https://clippingkk.example'
  resetServerEnvForTests()
})
it.each([
  'https://evil.test',
  '//evil.test',
  '/\\evil.test',
  '/auth',
  '/api/auth/logout',
  '/\n/evil.test',
])('rejects unsafe return path %s', (path) => expect(safeNext(path)).toBeNull())
it('preserves a local deep link', () =>
  expect(safeNext('/dash/1/home?tab=books#recent')).toBe(
    '/dash/1/home?tab=books#recent'
  ))
it('rejects missing or foreign origin', () => {
  for (const origin of [undefined, 'https://evil.test'])
    expect(() =>
      assertSameOrigin(
        new Request('https://clippingkk.example/api/v2/graphql', {
          headers: origin ? { origin } : {},
        })
      )
    ).toThrow()
  expect(() =>
    assertSameOrigin(
      new Request('https://clippingkk.example', {
        headers: { origin: 'https://clippingkk.example' },
      })
    )
  ).not.toThrow()
})
it('does not confuse cookies with similar names', () =>
  expect(
    cookieValue(
      new Request('https://example.test', {
        headers: {
          cookie: 'other-ck-session=bad; ck-session=correct; ck-uid=999',
        },
      })
    )
  ).toBe('correct'))
