import { NextRequest } from 'next/server'

import { COOKIE_TOKEN_KEY, USER_ID_KEY } from './constants/storage'
import { proxy } from './proxy'

test('clears stale authentication cookies before rendering the login page', () => {
  const request = new NextRequest(
    'https://clippingkk.example/auth/auth-v4?clean=true',
    {
      headers: {
        cookie: `${COOKIE_TOKEN_KEY}=stale-token; ${USER_ID_KEY}=1`,
      },
    }
  )

  const response = proxy(request)
  const setCookie = response.headers.get('set-cookie') ?? ''

  expect(response.status).toBe(200)
  expect(setCookie).toContain(`${COOKIE_TOKEN_KEY}=;`)
  expect(setCookie).toContain(`${USER_ID_KEY}=;`)
})
