import { resetServerEnvForTests } from '@/server/env'

import { register } from './instrumentation'

const originalEnv = { ...process.env }
let exit: ReturnType<typeof vi.spyOn>
let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  exit = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit(${code})`)
  })
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  process.env = { ...originalEnv, NEXT_RUNTIME: 'nodejs', RUN_WORKER: 'false' }
  delete process.env.DATABASE_URL
  delete process.env.REDIS_URL
  delete process.env.JWT_SECRET
  resetServerEnvForTests()
})

afterEach(() => {
  exit.mockRestore()
  consoleError.mockRestore()
})

afterAll(() => {
  process.env = originalEnv
  resetServerEnvForTests()
})

test('validates required server environment during Node.js startup', async () => {
  await expect(register()).rejects.toThrow('process.exit(1)')

  expect(exit).toHaveBeenCalledWith(1)
  expect(consoleError).toHaveBeenCalledWith(
    'Invalid server environment',
    expect.objectContaining({
      issues: expect.arrayContaining([
        expect.objectContaining({ path: ['DATABASE_URL'] }),
        expect.objectContaining({ path: ['REDIS_URL'] }),
        expect.objectContaining({ path: ['JWT_SECRET'] }),
      ]),
    })
  )
})

test('completes startup validation when required environment is valid', async () => {
  process.env.DATABASE_URL =
    'postgresql://postgres:admin@localhost:5432/clippingkk_test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.JWT_SECRET = 'test-jwt-secret'
  resetServerEnvForTests()

  await expect(register()).resolves.toBeUndefined()
})
