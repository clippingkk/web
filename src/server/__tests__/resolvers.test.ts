// @vitest-environment node

import type { Clipping } from '../db/schema'
import { resolvers } from '../graphql/resolvers'

test('treats legacy null clipping nouns as an empty list', async () => {
  const clipping = {
    content: 'A legacy clipping',
    nouns: null,
  } as unknown as Clipping

  await expect(resolvers.Clipping.richContent(clipping)).resolves.toEqual({
    html: 'A legacy clipping',
    plain: 'A legacy clipping',
    segments: ['A legacy clipping'],
    nouns: [],
  })
})
