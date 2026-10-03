// @vitest-environment node
import { expect, it, vi } from 'vitest'
const request = vi.hoisted(() => vi.fn())
vi.mock('../client', () => ({ gateRequest: request }))
vi.mock('../../env', () => ({
  getServerEnv: () => ({ LEGACY_AUTH_ENABLED: '0', rootUsers: new Set([1]) }),
}))
import { canAdmin } from '../authz'
it('takes administrators from ROOT_USERS without asking Gate', async () => {
  expect(await canAdmin(1)).toBe(true)
  expect(await canAdmin(2)).toBe(false)
  expect(request).not.toHaveBeenCalled()
})
