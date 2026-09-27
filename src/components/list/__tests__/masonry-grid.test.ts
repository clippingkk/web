import { describe, expect, it } from 'vitest'

import { distribute } from '../masonry-grid'

describe('distribute', () => {
  const height = (n: number) => n

  it('places each item in the currently shortest column', () => {
    expect(distribute([5, 1, 1, 1], 2, height)).toEqual([[5], [1, 1, 1]])
  })

  it('never moves existing items when a page is appended', () => {
    const first = [4, 2, 3, 1, 5]
    const before = distribute(first, 3, height)
    const after = distribute([...first, 2, 2, 7], 3, height)
    before.forEach((lane, index) => {
      expect(after[index].slice(0, lane.length)).toEqual(lane)
    })
  })

  it('always returns at least one column', () => {
    expect(distribute([1, 2], 0, height)).toEqual([[1, 2]])
  })
})
