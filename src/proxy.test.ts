import { expect, it } from 'vitest'

import { proxy } from './proxy'
it('never redirects based on unverified legacy cookies', () => {
  expect(proxy().status).toBe(200)
})
