/**
 * Pure shaping for a book summary: which highlights the model sees, how far
 * each one is cut, and which language those highlights are actually in.
 * The database load lives in book-summary.ts.
 */

export const BOOK_SUMMARY_SAMPLE = 40
export const BOOK_HIGHLIGHT_CHARS = 400
export const BOOK_SUMMARY_CHARS = 12_000

/** Cut by code point so a trimmed emoji is never a lone surrogate. */
export function clipChars(value: string, max: number) {
  return Array.from(value).slice(0, max).join('')
}

/**
 * Indexes spread from the first highlight to the last. A long book then
 * contributes its beginning, middle, and end rather than only the latest page.
 */
export function evenIndexes(length: number, limit: number) {
  if (length <= 0) return []
  if (length <= limit) return Array.from({ length }, (_, index) => index)
  const indexes: number[] = []
  const seen = new Set<number>()
  const step = (length - 1) / (limit - 1)
  for (let i = 0; i < limit; i++) {
    const index = Math.round(i * step)
    if (seen.has(index)) continue
    seen.add(index)
    indexes.push(index)
  }
  return indexes
}

export function sampleHighlights(contents: readonly string[]) {
  const cleaned = contents.map((item) => item.trim()).filter(Boolean)
  const indexes = evenIndexes(cleaned.length, BOOK_SUMMARY_SAMPLE)
  if (indexes.length === 0) return []
  const per = Math.min(
    BOOK_HIGHLIGHT_CHARS,
    Math.floor(BOOK_SUMMARY_CHARS / indexes.length)
  )
  return indexes.map((index) => clipChars(cleaned[index], per)).filter(Boolean)
}

/**
 * A name the shared prompt can drop into "Respond in …". Latin text stays
 * unnamed: English, French, and German share a script, and the model is told
 * to follow the highlights themselves.
 */
export function highlightLanguage(highlights: readonly string[]) {
  let hangul = 0
  let kana = 0
  let han = 0
  let cyrillic = 0
  let arabic = 0
  let latin = 0
  for (const text of highlights) {
    for (const char of text) {
      const code = char.codePointAt(0)!
      if (code >= 0xac00 && code <= 0xd7af) hangul++
      else if (
        (code >= 0x3040 && code <= 0x30ff) ||
        (code >= 0x31f0 && code <= 0x31ff)
      )
        kana++
      else if (code >= 0x4e00 && code <= 0x9fff) han++
      else if (code >= 0x0400 && code <= 0x04ff) cyrillic++
      else if (
        (code >= 0x0600 && code <= 0x06ff) ||
        (code >= 0x0750 && code <= 0x077f)
      )
        arabic++
      else if (
        (code >= 0x41 && code <= 0x5a) ||
        (code >= 0x61 && code <= 0x7a) ||
        (code >= 0xc0 && code <= 0x24f)
      )
        latin++
    }
  }
  // A little kana is a name or a quotation. Enough kana beside kanji is Japanese.
  const japanese = kana >= 2 && kana * 5 >= han
  const ranked = [
    ['Korean', hangul],
    ['Japanese', japanese ? kana + han : kana],
    ['Chinese', japanese ? 0 : han],
    ['Russian', cyrillic],
    ['Arabic', arabic],
  ] as const
  let name: (typeof ranked)[number][0] | '' = ''
  let count = 0
  for (const [script, scriptCount] of ranked) {
    if (scriptCount > count) {
      name = script
      count = scriptCount
    }
  }
  const identified = hangul + kana + han + cyrillic + arabic
  if (!name || count * 2 < identified + latin)
    return 'the language of the highlights'
  return name
}

export function summaryFingerprint(input: {
  title: string
  author: string
  highlights: readonly string[]
}) {
  return JSON.stringify({
    v: 1,
    title: input.title,
    author: input.author,
    highlights: input.highlights,
  })
}
