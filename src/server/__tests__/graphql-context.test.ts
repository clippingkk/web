import type { YogaInitialContext } from 'graphql-yoga'

import { createGraphQLContext } from '../graphql/context'

test('exposes authentication failures as unauthorized GraphQL errors', async () => {
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
