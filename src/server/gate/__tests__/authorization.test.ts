// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({
  subject: 'person' as string | null,
  request: vi.fn(),
}))
vi.mock('../../db', () => ({
  getDatabase: () => ({
    db: {
      query: {
        users: { findFirst: async () => ({ gateUserId: state.subject }) },
      },
    },
  }),
}))
vi.mock('../client', () => ({ gateRequest: state.request }))
vi.mock('../config', () => ({ gateConfig: () => ({ projectId: 'product' }) }))
vi.mock('../../env', () => ({
  getServerEnv: () => ({ LEGACY_AUTH_ENABLED: '1', rootUsers: new Set([1]) }),
}))
import { canAdmin, requireProductRead, requireProductWrite } from '../authz'
beforeEach(() => {
  state.subject = 'person'
  state.request.mockReset()
})
it('checks current Gate permission decisions and applies revocation immediately', async () => {
  state.request
    .mockResolvedValueOnce({ allowed: true })
    .mockResolvedValue({ allowed: false })
  await expect(requireProductRead(1)).resolves.toBeUndefined()
  await expect(requireProductRead(1)).rejects.toMatchObject({ status: 403 })
  await expect(requireProductWrite(1)).rejects.toMatchObject({ status: 403 })
})
it('does not elevate a linked legacy ROOT_USERS identity', async () => {
  state.request.mockResolvedValue({ allowed: false })
  expect(await canAdmin(1)).toBe(false)
  state.subject = null
  expect(await canAdmin(1)).toBe(true)
})
