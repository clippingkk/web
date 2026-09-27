import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  currentUserId: vi.fn(),
  canAdmin: vi.fn(),
  serverQuery: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url })
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
  notFound: vi.fn(),
}))
vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('@/server/gate/current', () => ({
  currentUserId: mocks.currentUserId,
}))
vi.mock('@/server/gate/authz', () => ({ canAdmin: mocks.canAdmin }))
vi.mock('../query', () => ({ serverQuery: mocks.serverQuery }))

import { requireViewerRoute } from '../path-user'
import { getViewer, requireViewer } from '../viewer'

const me = {
  id: 42,
  name: 'Anna',
  avatar: 'a.png',
  domain: 'annatarhe',
  email: 'anna@example.com',
  premiumEndAt: new Date(Date.now() + 86_400_000).toISOString(),
}

function signedInAs(user: typeof me | null) {
  mocks.currentUserId.mockResolvedValue(user?.id)
  mocks.serverQuery.mockResolvedValue(user ? { me: user } : null)
}

async function redirectedTo(promise: Promise<unknown>) {
  await expect(promise).rejects.toThrow('NEXT_REDIRECT')
  return mocks.redirect.mock.calls.at(-1)?.[0]
}

beforeEach(() => {
  mocks.redirect.mockClear()
  mocks.serverQuery.mockReset()
  mocks.currentUserId.mockReset()
  mocks.canAdmin.mockReset().mockResolvedValue(false)
  mocks.headers.mockResolvedValue(
    new Headers({ 'x-ck-path': '/dash/annatarhe/home?tab=books' })
  )
})

describe('getViewer', () => {
  it('is null when signed out, without querying', async () => {
    signedInAs(null)
    await expect(getViewer()).resolves.toBeNull()
    expect(mocks.serverQuery).not.toHaveBeenCalled()
    expect(mocks.canAdmin).not.toHaveBeenCalled()
  })

  it('adds slug, premium and admin to the lean profile', async () => {
    signedInAs(me)
    mocks.canAdmin.mockResolvedValue(true)
    await expect(getViewer()).resolves.toEqual({
      ...me,
      slug: 'annatarhe',
      isPremium: true,
      isAdmin: true,
    })
    expect(mocks.serverQuery.mock.calls[0][1]).toEqual({ id: 42 })
    // Public pages call this too: a stale session is "signed out", not a redirect.
    expect(mocks.serverQuery.mock.calls[0][2]).toEqual({
      notFound: 'null',
      unauthorized: 'null',
    })
  })

  it('uses the id as slug for a legacy numeric domain', async () => {
    signedInAs({ ...me, domain: '12345', premiumEndAt: '' })
    await expect(getViewer()).resolves.toMatchObject({
      slug: '42',
      isPremium: false,
    })
  })

  it('treats a Gate outage as not admin rather than failing the page', async () => {
    signedInAs(me)
    mocks.canAdmin.mockRejectedValue(new Error('gate down'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(getViewer()).resolves.toMatchObject({ isAdmin: false })
  })

  it('is null when the API no longer knows the session', async () => {
    mocks.currentUserId.mockResolvedValue(42)
    mocks.serverQuery.mockResolvedValue(null)
    await expect(getViewer()).resolves.toBeNull()
  })
})

describe('requireViewer', () => {
  it('returns the viewer', async () => {
    signedInAs(me)
    await expect(requireViewer()).resolves.toMatchObject({ id: 42 })
  })

  it('sends a signed-out reader to sign-in, back to the current page', async () => {
    signedInAs(null)
    expect(await redirectedTo(requireViewer())).toBe(
      `/auth?next=${encodeURIComponent('/dash/annatarhe/home?tab=books')}`
    )
  })

  it('uses an explicit next when given', async () => {
    signedInAs(null)
    expect(await redirectedTo(requireViewer('/pricing'))).toBe(
      `/auth?next=${encodeURIComponent('/pricing')}`
    )
  })
})

describe('requireViewerRoute', () => {
  it('sends a signed-out reader to sign-in with the page as next', async () => {
    signedInAs(null)
    expect(
      await redirectedTo(requireViewerRoute('annatarhe', 'upload', '?step=2'))
    ).toBe(`/auth?next=${encodeURIComponent('/dash/annatarhe/upload?step=2')}`)
  })

  it("moves someone else's URL to the viewer's own, keeping the search", async () => {
    signedInAs(me)
    expect(
      await redirectedTo(
        requireViewerRoute('someone', 'settings/web', '?tab=ai&x=1')
      )
    ).toBe('/dash/annatarhe/settings/web?tab=ai&x=1')
  })

  it('accepts a search without its leading ?', async () => {
    signedInAs(me)
    expect(await redirectedTo(requireViewerRoute('7', 'upload', 'a=b'))).toBe(
      '/dash/annatarhe/upload?a=b'
    )
  })

  it('redirects to the id when the viewer has no usable domain', async () => {
    signedInAs({ ...me, domain: '' })
    expect(await redirectedTo(requireViewerRoute('someone', 'upload'))).toBe(
      '/dash/42/upload'
    )
  })

  it.each(['annatarhe', 'AnnatarHe', '42'])(
    'returns the viewer on their own URL (%s)',
    async (userid) => {
      signedInAs(me)
      await expect(
        requireViewerRoute(userid, 'upload', '?x=1')
      ).resolves.toMatchObject({ id: 42, slug: 'annatarhe' })
      expect(mocks.redirect).not.toHaveBeenCalled()
    }
  )
})
