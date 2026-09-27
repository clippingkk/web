import { authHref, isSameOriginPath } from '../auth-href'

it.each([undefined, null, ''])(
  'links to plain sign-in without next (%s)',
  (next) => expect(authHref(next)).toBe('/auth')
)

it('encodes a same-origin next, keeping its query intact', () => {
  const next = '/dash/42/home?filter=books&sort=newest#recent'
  expect(authHref(next)).toBe(`/auth?next=${encodeURIComponent(next)}`)
  expect(
    new URL(authHref(next), 'https://ck.test').searchParams.get('next')
  ).toBe(next)
})

it.each([
  'https://evil.test/dash',
  '//evil.test',
  '/\\evil.test',
  'dash/1/home',
  '/\n/evil.test',
  '/ spaced',
  'javascript:alert(1)',
])('drops a foreign or malformed next (%j)', (next) => {
  expect(isSameOriginPath(next)).toBe(false)
  expect(authHref(next)).toBe('/auth')
})

it.each(['/auth', '/auth?next=/dash', '/auth/auth-v4', '/api/auth/login'])(
  'never loops back into sign-in or the API (%s)',
  (next) => expect(authHref(next)).toBe('/auth')
)

it('keeps paths that merely start with the same letters', () => {
  expect(authHref('/authors')).toBe(
    `/auth?next=${encodeURIComponent('/authors')}`
  )
})
