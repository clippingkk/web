import { describe, expect, it } from 'vitest'

import { splitClippingLines } from '../clipping-text'

describe('splitClippingLines', () => {
  it('splits Kindle bullet paragraphs and drops footnote markers', () => {
    expect(splitClippingLines('First part[12] • Second part •  ')).toEqual([
      'First part',
      'Second part',
    ])
  })

  it('limits the number of paragraphs when asked', () => {
    expect(splitClippingLines('a•b•c', 2)).toEqual(['a', 'b'])
  })

  it('returns nothing for blank content', () => {
    expect(splitClippingLines(' • ')).toEqual([])
  })
})
