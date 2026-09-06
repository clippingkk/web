import type { YogaInitialContext } from 'graphql-yoga'

import { resetServerEnvForTests } from '../env'
import { createGraphQLContext } from '../graphql/context'

test('exposes authentication failures as unauthorized GraphQL errors', async () => {
  process.env.DATABASE_URL = 'postgres://localhost/test'
  process.env.REDIS_URL = 'redis://localhost'
  process.env.JWT_SECRET = 'test-secret'
  process.env.LEGACY_AUTH_ENABLED = '1'
  resetServerEnvForTests()
  const request = new Request('https://clippingkk.example/api/v2/graphql', {
    headers: { Authorization: 'Bearer invalid-token' },
  })

  await expect(
    createGraphQLContext({ request } as YogaInitialContext)
  ).rejects.toMatchObject({
    message: 'invalid token',
    extensions: {
      code: 'UNAUTHORIZED',
      http: { status: 401 },
    },
  })
})
