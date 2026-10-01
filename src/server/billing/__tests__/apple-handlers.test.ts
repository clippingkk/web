// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  verifyNotification: vi.fn(),
  verifyTransaction: vi.fn(),
  verifyRenewalInfo: vi.fn(),
  ownerOf: vi.fn(),
  apply: vi.fn(),
  billingState: vi.fn(),
  userId: vi.fn(),
}))
vi.mock('../apple/verify', () => ({
  verifyNotification: mocks.verifyNotification,
  verifyTransaction: mocks.verifyTransaction,
  verifyRenewalInfo: mocks.verifyRenewalInfo,
}))
vi.mock('../apple/sync', () => ({
  ownerOf: mocks.ownerOf,
  applyAppleUpdate: mocks.apply,
}))
vi.mock('../state', () => ({ billingState: mocks.billingState }))
vi.mock('../../auth', () => ({ requireUserId: mocks.userId }))
vi.mock('../../redis', () => ({ rateLimit: async () => ({ allowed: true }) }))
import { ApiError } from '../../errors'
import {
  receiveAppleNotification,
  submitAppleTransaction,
} from '../apple/handlers'

const post = (body: unknown) =>
  new Request('https://example.com/api/billing/apple', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
const transaction = { originalTransactionId: '1000' }
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  mocks.verifyNotification.mockResolvedValue({
    notificationType: 'DID_RENEW',
    data: { signedTransactionInfo: 'tx', signedRenewalInfo: 'renewal' },
  })
  mocks.verifyTransaction.mockResolvedValue(transaction)
  mocks.verifyRenewalInfo.mockResolvedValue({ autoRenewStatus: 1 })
  mocks.ownerOf.mockResolvedValue(7)
  mocks.apply.mockResolvedValue(undefined)
  mocks.userId.mockResolvedValue(7)
  mocks.billingState.mockResolvedValue({
    premiumEndAt: '2099-01-01T00:00:00.000Z',
  })
})

it('applies a renewal notification to the reader who owns it', async () => {
  const response = await receiveAppleNotification(
    post({ signedPayload: 'payload' })
  )
  expect(await response.json()).toMatchObject({ data: { outcome: 'applied' } })
  expect(mocks.apply).toHaveBeenCalledWith(7, {
    transaction,
    renewal: { autoRenewStatus: 1 },
  })
})

it('acknowledges notifications it cannot use so Apple stops resending them', async () => {
  mocks.verifyNotification.mockResolvedValueOnce({
    notificationType: 'TEST',
    data: {},
  })
  expect(
    await (await receiveAppleNotification(post({ signedPayload: 'p' }))).json()
  ).toMatchObject({
    data: { outcome: 'ignored' },
  })
  mocks.ownerOf.mockResolvedValueOnce(null)
  expect(
    await (await receiveAppleNotification(post({ signedPayload: 'p' }))).json()
  ).toMatchObject({
    data: { outcome: 'unknown_reader' },
  })
  mocks.verifyNotification.mockRejectedValueOnce(
    new ApiError('bad', 400, 'APPLE_TRANSACTION_INVALID')
  )
  expect(
    await (await receiveAppleNotification(post({ signedPayload: 'p' }))).json()
  ).toMatchObject({
    data: { outcome: 'rejected' },
  })
  expect(mocks.apply).not.toHaveBeenCalled()
})

it('fails so Apple retries when Gate or Apple is down', async () => {
  mocks.apply.mockRejectedValue(new ApiError('down', 503, 'GATE_UNAVAILABLE'))
  await expect(
    receiveAppleNotification(post({ signedPayload: 'p' }))
  ).rejects.toMatchObject({
    status: 503,
  })
})

it('returns the new billing state after the app reports a purchase', async () => {
  const response = await submitAppleTransaction(
    post({ signedTransaction: 'tx', signedRenewalInfo: 'renewal' })
  )
  expect(response.headers.get('Cache-Control')).toBe('no-store')
  expect(await response.json()).toMatchObject({
    data: { premiumEndAt: '2099-01-01T00:00:00.000Z' },
  })
  expect(mocks.apply).toHaveBeenCalledWith(7, {
    transaction,
    renewal: { autoRenewStatus: 1 },
  })
})

it('rejects unexpected fields and oversized bodies', async () => {
  await expect(
    submitAppleTransaction(post({ signedTransaction: 'tx', extra: true }))
  ).rejects.toMatchObject({ status: 400 })
  await expect(
    submitAppleTransaction(post({ signedTransaction: 'x'.repeat(40_000) }))
  ).rejects.toMatchObject({ status: 413 })
})
