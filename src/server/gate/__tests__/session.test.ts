import { GraphQLError } from 'graphql'
// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({
  values: new Map<string, unknown>(),
  refresh: vi.fn(),
  active: true,
}))
vi.mock('../authz', () => ({
  requireProductRead: vi.fn(async () => undefined),
}))
vi.mock('../../db', () => ({
  getDatabase: () => ({
    db: {
      query: {
        users: {
          findFirst: async () => (state.active ? { id: 1 } : undefined),
        },
      },
    },
  }),
}))
vi.mock('../oidc', () => ({
  randomToken: () => 'a'.repeat(43),
  refreshTokens: state.refresh,
  revokeToken: vi.fn(async () => undefined),
}))
vi.mock('../../redis', () => ({
  cacheGet: async (key: string) => state.values.get(key),
  cacheSet: async (key: string, value: unknown) => state.values.set(key, value),
  cacheDelete: async (key: string) => state.values.delete(key),
  getRedis: async () => ({
    set: async (
      key: string,
      value: string,
      options: { NX?: boolean; XX?: boolean }
    ) => {
      if (
        (options.NX && state.values.has(key)) ||
        (options.XX && !state.values.has(key))
      )
        return null
      state.values.set(
        key,
        key.endsWith(':refresh') ? value : JSON.parse(value)
      )
      return 'OK'
    },
    exists: async (key: string) => (state.values.has(key) ? 1 : 0),
    eval: async (_script: string, { keys }: { keys: string[] }) =>
      state.values.delete(keys[0]),
    sAdd: vi.fn(),
    sRem: vi.fn(),
  }),
}))
import { createSession, readSession, destroySession } from '../session'
beforeEach(() => {
  state.values.clear()
  state.refresh.mockReset()
  state.active = true
})
async function session() {
  return createSession({
    localUserId: 1,
    gateUserId: 'gate-user',
    accessToken: 'old',
    refreshToken: 'refresh',
    accessTokenExpiresAt: Date.now() - 1,
  })
}
it('serializes concurrent rotating refreshes without extending absolute expiry', async () => {
  const original = await session()
  state.refresh.mockImplementation(async () => {
    await new Promise((r) => setTimeout(r, 25))
    return { accessToken: 'new', refreshToken: 'rotated', expiresIn: 600 }
  })
  const results = await Promise.all([
    readSession(original.id),
    readSession(original.id),
  ])
  expect(state.refresh).toHaveBeenCalledTimes(1)
  for (const result of results)
    expect(result).toMatchObject({
      accessToken: 'new',
      refreshToken: 'rotated',
      expiresAt: original.expiresAt,
    })
})
it('retains the grant on transient failure but invalidates rejected grants', async () => {
  const original = await session()
  state.refresh.mockRejectedValueOnce(new Error('network'))
  await expect(readSession(original.id)).rejects.toMatchObject({ status: 503 })
  expect(state.values.has(`ck:gate:session:${original.id}`)).toBe(true)
  state.refresh.mockRejectedValueOnce(
    new GraphQLError('revoked', { extensions: { gateError: 'invalid_grant' } })
  )
  expect(await readSession(original.id)).toBeNull()
})
it('does not resurrect a session when logout races a refresh', async () => {
  const original = await session()
  state.refresh.mockImplementation(async () => {
    await destroySession(original.id)
    return { accessToken: 'new', refreshToken: 'rotated', expiresIn: 600 }
  })
  expect(await readSession(original.id)).toBeNull()
})
it('rejects every session for a disabled local account', async () => {
  const original = await session()
  state.active = false
  expect(await readSession(original.id)).toBeNull()
  expect(state.refresh).not.toHaveBeenCalled()
})
