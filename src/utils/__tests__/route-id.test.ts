import { describe, expect, it } from 'vitest'

import { parseRouteId } from '../route-id'

describe('parseRouteId', () => {
  it('reads positive integer ids', () => {
    expect(parseRouteId('42')).toBe(42)
    expect(parseRouteId('007')).toBe(7)
  })

  it('rejects anything a GraphQL Int id cannot be', () => {
    for (const value of ['', '0', '-3', '1.5', '12abc', 'abc', '2147483648']) {
      expect(parseRouteId(value)).toBeNull()
    }
  })
})
