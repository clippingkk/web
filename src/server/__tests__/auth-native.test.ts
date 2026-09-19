// @vitest-environment node
import { beforeEach, expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  native: vi.fn(),
  cookie: vi.fn(),
}))
vi.mock('../gate/native', async (original) => ({
  ...(await original<typeof import('../gate/native')>()),
  readNativeSession: state.native,
}))
vi.mock('../gate/session', () => ({ readSession: state.cookie }))

import { optionalUserId } from '../auth'
import { resetServerEnvForTests } from '../env'

const token = `ck_ios_${'a'.repeat(43)}`
const request = (headers: Record<string, string>) =>
  new Request('https://clippingkk.example/api/v2/graphql', {
    method: 'POST',
    headers,
  })

beforeEach(() => {
  process.env.DATABASE_URL =
    'postgresql://postgres:admin@localhost:5432/clippingkk_test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  // The iOS app must keep working once legacy credentials are switched off.
  process.env.LEGACY_AUTH_ENABLED = '0'
  resetServerEnvForTests()
  state.native.mockReset()
  state.cookie.mockReset()
})

test('resolves a native bearer to its local user with legacy auth disabled', async () => {
  state.native.mockResolvedValue({ localUserId: 42 })
  await expect(
    optionalUserId(request({ Authorization: `Bearer ${token}` }))
  ).resolves.toBe(42)
  expect(state.native).toHaveBeenCalledWith(token)
})

test('an ended native session is unauthorized rather than a legacy rejection', async () => {
  state.native.mockResolvedValue(null)
  await expect(
    optionalUserId(request({ Authorization: `Bearer ${token}` }))
  ).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
})

test('a native credential wins over a cookie and never falls back to it', async () => {
  state.cookie.mockResolvedValue({ localUserId: 1 })
  const headers = {
    Authorization: `Bearer ${token}`,
    Cookie: `ck-session=${'b'.repeat(43)}`,
  }
  state.native.mockResolvedValue({ localUserId: 42 })
  await expect(optionalUserId(request(headers))).resolves.toBe(42)

  state.native.mockResolvedValue(null)
  await expect(optionalUserId(request(headers))).rejects.toMatchObject({
    status: 401,
  })
  expect(state.cookie).not.toHaveBeenCalled()
})

test('a refresh outage surfaces as 503 so the app keeps its credential', async () => {
  state.native.mockRejectedValue(
    Object.assign(new Error('Gate is temporarily unavailable.'), {
      status: 503,
    })
  )
  await expect(
    optionalUserId(request({ Authorization: `Bearer ${token}` }))
  ).rejects.toMatchObject({ status: 503 })
})
