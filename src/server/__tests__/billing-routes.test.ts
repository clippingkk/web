// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  userId: vi.fn(),
  isPremium: vi.fn(),
  createCheckout: vi.fn(),
  canAdmin: vi.fn(),
  diagnostics: vi.fn(),
}))
vi.mock('next/server', () => ({ connection: vi.fn() }))
vi.mock('@/server/env', () => ({
  getServerEnv: () => ({
    APP_ORIGIN: 'https://example.com',
    corsAllowedOrigins: new Set<string>(),
  }),
}))
vi.mock('@/server/auth', () => ({ requireUserId: mocks.userId }))
vi.mock('@/server/billing/premium', () => ({ isPremium: mocks.isPremium }))
vi.mock('@/server/billing/gate', () => ({
  createCheckout: mocks.createCheckout,
}))
vi.mock('@/server/gate/authz', () => ({ canAdmin: mocks.canAdmin }))
vi.mock('@/server/billing/diagnostics', () => ({
  billingDiagnostics: mocks.diagnostics,
}))
import { GET as diagnostics } from '@/app/api/billing/diagnostics/route'
import { POST as checkout } from '@/app/api/v2/payment-subscription/route'

beforeEach(() => {
  mocks.userId.mockResolvedValue(7)
  mocks.isPremium.mockResolvedValue(false)
  mocks.createCheckout.mockResolvedValue({
    id: 'cs_1',
    url: 'https://checkout.test/cs_1',
  })
  mocks.canAdmin.mockResolvedValue(false)
  mocks.diagnostics.mockResolvedValue([
    { name: 'gate.config', ok: true, detail: '' },
  ])
})
const post = () =>
  new Request('https://example.com/api/v2/payment-subscription', {
    method: 'POST',
    headers: { 'idempotency-key': '0123456789abcdef0123' },
  })

it('opens Stripe checkout for a Free reader', async () => {
  const response = await checkout(post())
  expect(await response.json()).toMatchObject({
    data: { checkoutUrl: 'https://checkout.test/cs_1' },
  })
  expect(mocks.createCheckout).toHaveBeenCalledWith(
    7,
    'ck-7-0123456789abcdef0123'
  )
})

it('does not sell a second subscription to a Premium reader', async () => {
  mocks.isPremium.mockResolvedValue(true)
  const response = await checkout(post())
  expect(response.status).toBe(409)
  expect(await response.json()).toMatchObject({ code: 'ALREADY_PREMIUM' })
  expect(mocks.createCheckout).not.toHaveBeenCalled()
})

it('shows billing diagnostics to administrators only', async () => {
  const request = () =>
    new Request('https://example.com/api/billing/diagnostics')
  expect((await diagnostics(request())).status).toBe(403)
  expect(mocks.diagnostics).not.toHaveBeenCalled()
  mocks.canAdmin.mockResolvedValue(true)
  const response = await diagnostics(request())
  expect(await response.json()).toMatchObject({ data: { ok: true } })
})
