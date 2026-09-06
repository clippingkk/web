// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  attempt: null as null | {
    verifier: string
    nonce: string
    browser: string
    next: string
  },
  exchange: vi.fn(),
  verify: vi.fn(),
  user: vi.fn(),
  session: vi.fn(),
}))
vi.mock('../../http', () => ({ route: (handler: unknown) => handler }))
vi.mock('../../redis', () => ({
  getRedis: async () => ({
    eval: async (
      _script: string,
      { arguments: args }: { arguments: string[] }
    ) => {
      if (mocks.attempt?.browser !== args[0]) return null
      const result = JSON.stringify(mocks.attempt)
      mocks.attempt = null
      return result
    },
  }),
}))
vi.mock('../config', () => ({
  gateConfig: () => ({ appOrigin: 'https://clippingkk.example' }),
}))
vi.mock('../oidc', () => ({ exchangeCode: mocks.exchange }))
vi.mock('../verify', () => ({ verifyIdToken: mocks.verify }))
vi.mock('../user', () => ({
  ensureLocalUser: mocks.user,
  provisionMember: vi.fn(async () => undefined),
}))
vi.mock('../session', () => ({
  createSession: mocks.session,
  destroySession: vi.fn(async () => undefined),
  SESSION_TTL: 3600,
}))
import { GET } from '@/app/api/auth/callback/route'
beforeEach(() => {
  mocks.attempt = {
    verifier: 'verifier',
    nonce: 'nonce',
    browser: 'browser',
    next: '/dash/42/home',
  }
  mocks.exchange.mockClear()
  mocks.exchange.mockResolvedValue({
    idToken: 'id',
    accessToken: 'secret',
    refreshToken: 'refresh-secret',
    expiresIn: 600,
  })
  mocks.verify.mockResolvedValue({ gateUserId: 'gate' })
  mocks.user.mockResolvedValue({ id: 42 })
  mocks.session.mockResolvedValue({ id: 'opaque-session' })
})
const request = (browser = 'browser') =>
  new Request(
    `https://clippingkk.example/api/auth/callback?state=${'a'.repeat(43)}&code=code`,
    { headers: { cookie: `ck-oidc=${browser}` } }
  )
it('consumes the browser-bound login once and never sends Gate tokens to the browser', async () => {
  const response = await GET(request())
  expect(response.headers.get('location')).toBe(
    'https://clippingkk.example/dash/42/home'
  )
  expect(response.headers.get('set-cookie')).toContain('HttpOnly')
  expect(response.headers.get('set-cookie')).not.toContain('secret')
  await GET(request())
  expect(mocks.exchange).toHaveBeenCalledTimes(1)
})
it('does not exchange codes or consume state from another browser', async () => {
  const response = await GET(request('wrong-browser'))
  expect(response.headers.get('location')).toContain('/auth?error=')
  expect(mocks.exchange).not.toHaveBeenCalled()
  expect(mocks.attempt).not.toBeNull()
})
it('refuses expired login attempts before contacting Gate', async () => {
  mocks.attempt = null
  await GET(request())
  expect(mocks.exchange).not.toHaveBeenCalled()
})
