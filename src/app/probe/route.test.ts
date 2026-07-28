const { connection, isDatabaseReady, isRedisReady } = vi.hoisted(() => ({
  connection: vi.fn<() => Promise<void>>(),
  isDatabaseReady: vi.fn<() => Promise<boolean>>(),
  isRedisReady: vi.fn<() => Promise<boolean>>(),
}))

vi.mock('next/server', () => ({ connection }))
vi.mock('@/server/db', () => ({ isDatabaseReady }))
vi.mock('@/server/redis', () => ({ isRedisReady }))

import { GET } from './route'

beforeEach(() => {
  connection.mockResolvedValue()
  isDatabaseReady.mockResolvedValue(true)
  isRedisReady.mockResolvedValue(true)
})

test('defers readiness checks to request time', async () => {
  const response = await GET()

  expect(connection).toHaveBeenCalledOnce()
  expect(connection.mock.invocationCallOrder[0]).toBeLessThan(
    isDatabaseReady.mock.invocationCallOrder[0]
  )
  expect(connection.mock.invocationCallOrder[0]).toBeLessThan(
    isRedisReady.mock.invocationCallOrder[0]
  )
  expect(response.status).toBe(204)
})
