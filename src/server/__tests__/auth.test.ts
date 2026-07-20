import { resetServerEnvForTests } from '../env'
import { decodeLegacyValue, encodeLegacyValue } from '../legacy-crypto'

beforeEach(() => {
  process.env.DATABASE_URL =
    'postgresql://postgres:admin@localhost:5432/clippingkk_test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.WECHAT_SECRET = 'test-wechat-secret'
  resetServerEnvForTests()
})

test('round trips legacy AES-CFB values used by X-CLI and WeChat binding', async () => {
  const encrypted = await encodeLegacyValue('legacy-token-value')

  expect(encrypted).not.toContain('legacy-token-value')
  await expect(decodeLegacyValue(encrypted)).resolves.toBe('legacy-token-value')
})
