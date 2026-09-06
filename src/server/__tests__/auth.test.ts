import { optionalUserId } from '../auth'
import { resetServerEnvForTests } from '../env'
import { decodeLegacyValue, encodeLegacyValue } from '../legacy-crypto'

beforeEach(() => {
  process.env.DATABASE_URL =
    'postgresql://postgres:admin@localhost:5432/clippingkk_test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.LEGACY_AUTH_ENABLED = '1'
  process.env.WECHAT_SECRET = 'test-wechat-secret'
  resetServerEnvForTests()
})

test('round trips legacy AES-CFB values used by X-CLI and WeChat binding', async () => {
  const encrypted = await encodeLegacyValue('legacy-token-value')

  expect(encrypted).not.toContain('legacy-token-value')
  await expect(decodeLegacyValue(encrypted)).resolves.toBe('legacy-token-value')
})

test('normalizes invalid bearer tokens as unauthorized', async () => {
  const request = new Request('https://clippingkk.example/api/v2/graphql', {
    headers: { Authorization: 'Bearer invalid-token' },
  })

  await expect(optionalUserId(request)).rejects.toMatchObject({
    message: 'invalid token',
    status: 401,
    code: 'UNAUTHORIZED',
  })
})

test('legacy credentials are rejected when compatibility is disabled', async () => {
  process.env.LEGACY_AUTH_ENABLED = '0'
  resetServerEnvForTests()
  await expect(
    optionalUserId(
      new Request('https://example.test', {
        headers: { Authorization: 'Bearer old' },
      })
    )
  ).rejects.toMatchObject({ code: 'LEGACY_AUTH_DISABLED' })
})
