import { describe, expect, it } from 'vitest'

import {
  countShareable,
  excerpt,
  pickHighlights,
  randomWindow,
  textWidth,
  tidyNote,
} from './poster-text'

// A deterministic stand-in for Math.random.
function seeded(seed = 1) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

const clipping = (id: number, content: string, visible = true) => ({
  id,
  content,
  visible,
})

describe('excerpt', () => {
  it('counts wide characters as two units', () => {
    expect(textWidth('abc')).toBe(3)
    expect(textWidth('阅读，')).toBe(6)
    expect(textWidth('읽기')).toBe(4)
  })
  it('keeps short text and collapses whitespace', () => {
    expect(excerpt('  Remember\n\n every   word. ', 40)).toBe(
      'Remember every word.'
    )
  })
  it('cuts Latin text at a word boundary', () => {
    expect(excerpt('The quick brown fox jumps over the lazy dog', 22)).toBe(
      'The quick brown fox…'
    )
  })
  it('cuts CJK text by width and drops trailing punctuation', () => {
    expect(excerpt('我们读书，是为了遇见更好的自己。', 10)).toBe('我们读书…')
  })
})

describe('tidyNote', () => {
  it('trims and keeps at most one blank line', () => {
    expect(tidyNote('\n  First\n\n\n\nSecond  \n')).toBe('First\n\nSecond')
  })
})

describe('pickHighlights', () => {
  const pool = [
    clipping(1, 'A highlight that fits the poster.'),
    clipping(2, 'Another highlight that fits nicely.'),
    clipping(3, 'A third highlight of comfortable length.'),
    clipping(4, 'A fourth highlight, also comfortable.'),
    clipping(5, 'Private thoughts that must stay private.', false),
    clipping(6, 'Too long. '.repeat(40)),
    clipping(7, 'short'),
    clipping(8, '   '),
  ]

  it('only picks public highlights, without duplicates', () => {
    for (let seed = 1; seed < 50; seed++) {
      const picked = pickHighlights(pool, { random: seeded(seed) })
      expect(picked).toHaveLength(3)
      expect(new Set(picked.map((item) => item.id)).size).toBe(3)
      expect(picked.every((item) => item.visible)).toBe(true)
      expect(picked.some((item) => item.id === 8)).toBe(false)
    }
  })

  it('prefers highlights that fit the poster', () => {
    for (let seed = 1; seed < 50; seed++) {
      const ids = pickHighlights(pool, { random: seeded(seed) }).map(
        (item) => item.id
      )
      expect(ids.every((id) => id >= 1 && id <= 4)).toBe(true)
    }
  })

  it('falls back to any public highlight in a small pool', () => {
    const picked = pickHighlights([pool[0], pool[5], pool[6], pool[4]], {
      random: seeded(),
    })
    expect(picked.map((item) => item.id).sort()).toEqual([1, 6, 7])
  })

  it('shows fresh highlights first when shuffling', () => {
    const picked = pickHighlights(pool, {
      exclude: [1, 2, 3],
      random: seeded(3),
    })
    expect(picked[0].id).toBe(4)
    expect(picked.map((item) => item.id)).not.toContain(5)
  })

  it('counts what can be shared', () => {
    expect(countShareable(pool)).toBe(6)
  })
})

describe('randomWindow', () => {
  it('stays within the book', () => {
    expect(randomWindow(40, 100, () => 0.99)).toEqual({ limit: 100, offset: 0 })
    expect(randomWindow(250, 100, () => 0)).toEqual({ limit: 100, offset: 0 })
    expect(randomWindow(250, 100, () => 0.9999)).toEqual({
      limit: 100,
      offset: 150,
    })
  })
})
