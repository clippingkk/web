import { describe, expect, it } from 'vitest'

import {
  CJK_STACK,
  isLatin,
  LATIN_STACK,
  posterFontFamily,
} from './poster-fonts'

describe('poster fonts', () => {
  it('leads with LXGW WenKai for any CJK text', () => {
    expect(posterFontFamily('阅读')).toBe(CJK_STACK)
    expect(posterFontFamily('ノルウェイの森')).toBe(CJK_STACK)
    expect(posterFontFamily('Reading 阅读 mixed')).toBe(CJK_STACK)
  })
  it('leads with Literata for Latin or empty text', () => {
    expect(posterFontFamily('Remember every word.')).toBe(LATIN_STACK)
    expect(posterFontFamily('“Quoted” — text…')).toBe(LATIN_STACK)
    expect(posterFontFamily('')).toBe(LATIN_STACK)
    expect(isLatin('Jane Austen')).toBe(true)
    expect(isLatin('鲁迅')).toBe(false)
  })
})
