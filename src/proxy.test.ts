// @vitest-environment node
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import { expect, it } from 'vitest'

import { config, proxy } from './proxy'

function run(url: string, headers: HeadersInit = {}) {
  return proxy(new NextRequest(url, { headers }))
}

/** What NextResponse.next({ request: { headers } }) hands to the renderer. */
function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`)
}

it('never redirects based on unverified legacy cookies', () => {
  const response = run('https://ck.test/dash/1/home', {
    cookie: 'ck-token=legacy; ck-uid=1',
  })
  expect(response.status).toBe(200)
  expect(response.headers.get('location')).toBeNull()
})

it('forwards the pathname and search to server components', () => {
  const response = run('https://ck.test/dash/annatarhe/clippings/7?iac=0&x=%2F')
  expect(forwarded(response, 'x-ck-path')).toBe(
    '/dash/annatarhe/clippings/7?iac=0&x=%2F'
  )
  expect(response.headers.get('x-middleware-override-headers')).toContain(
    'x-ck-path'
  )
})

it('overwrites a client-supplied x-ck-path', () => {
  const response = run('https://ck.test/pricing', {
    'x-ck-path': '//evil.test',
  })
  expect(forwarded(response, 'x-ck-path')).toBe('/pricing')
})

it('keeps the other request headers', () => {
  const response = run('https://ck.test/', { cookie: 'ck-session=abc' })
  expect(forwarded(response, 'cookie')).toBe('ck-session=abc')
  expect(forwarded(response, 'x-ck-path')).toBe('/')
})

it.each([
  '/',
  '/auth',
  '/auth?next=%2Fdash%2F1%2Fhome',
  '/dash/1/home',
  '/dash/annatar.he/home',
  '/dash/annatar.he',
  '/pricing',
  '/apiary',
])('runs on page %s', (path) => {
  expect(
    unstable_doesMiddlewareMatch({ config, url: `https://ck.test${path}` })
  ).toBe(true)
})

it.each([
  '/api',
  '/api/v2/graphql',
  '/api/auth/callback?code=1',
  '/_next/static/chunks/main.js',
  '/_next/image?url=%2Fa.png',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/images/cover.png',
])('skips %s', (path) => {
  expect(
    unstable_doesMiddlewareMatch({ config, url: `https://ck.test${path}` })
  ).toBe(false)
})
