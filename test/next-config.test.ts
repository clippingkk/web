// @vitest-environment node
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server'

import nextConfig from '../next.config'

const ORIGIN = 'https://clippingkk.example'

async function follow(path: string) {
  const response = await unstable_getResponseFromNextConfig({
    url: `${ORIGIN}${path}`,
    nextConfig,
  })
  const location = getRedirectUrl(response)
  return {
    status: response.status,
    location: location ? location.replace(ORIGIN, '') : null,
  }
}

it('declares the retired auth and onboarding routes', async () => {
  expect(await nextConfig.redirects?.()).toEqual([
    {
      source: '/auth/:legacy(auth-v2|auth-v3|auth-v4|signin|phone|github)',
      destination: '/auth',
      permanent: true,
    },
    {
      source: '/auth/callback/:provider(apple|metamask)',
      destination: '/auth',
      permanent: false,
    },
    {
      source: '/dash/:userid/newbie',
      destination: '/dash/:userid/profile?with_profile_editor=1',
      permanent: true,
    },
  ])
})

it.each(['auth-v2', 'auth-v3', 'auth-v4', 'signin', 'phone', 'github'])(
  'permanently moves /auth/%s to /auth',
  async (legacy) => {
    expect(await follow(`/auth/${legacy}`)).toEqual({
      status: 308,
      location: '/auth',
    })
  }
)

it('carries next through a legacy sign-in link', async () => {
  const next = encodeURIComponent('/dash/42/home?tab=books')
  expect(await follow(`/auth/auth-v4?next=${next}`)).toEqual({
    status: 308,
    location: `/auth?next=${next}`,
  })
})

it.each(['apple', 'metamask'])(
  'temporarily sends the old %s callback to /auth',
  async (provider) => {
    expect(await follow(`/auth/callback/${provider}?i=token`)).toEqual({
      status: 307,
      location: '/auth?i=token',
    })
  }
)

it('opens the profile editor where the newbie page used to be', async () => {
  const { status, location } = await follow(
    '/dash/annatarhe/newbie?from_auth=1'
  )
  expect(status).toBe(308)
  const url = new URL(location!, ORIGIN)
  expect(url.pathname).toBe('/dash/annatarhe/profile')
  expect(Object.fromEntries(url.searchParams)).toEqual({
    with_profile_editor: '1',
    from_auth: '1',
  })
})

it.each(['/auth', '/auth/callback/github', '/dash/1/home', '/auth/unknown'])(
  'leaves %s alone',
  async (path) => {
    expect((await follow(path)).location).toBeNull()
  }
)
