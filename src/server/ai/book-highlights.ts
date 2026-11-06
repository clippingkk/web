/**
 * Pure shaping for a book summary: which highlights the model sees, how far
 * each one is cut, and which language those highlights are actually in.
 * The database load lives in book-summary.ts.
 */

export const BOOK_SUMMARY_SAMPLE = 40
export const BOOK_HIGHLIGHT_CHARS = 400
export const BOOK_SUMMARY_CHARS = 12_000

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

/** Cuts by what a reader sees as one character, so no emoji or accent is ever split. */
export function clipChars(value: string, max: number) {
  if (value.length <= max) return value
  return Iterator.from(graphemes.segment(value))
    .take(max)
    .map(({ segment }) => segment)
    .toArray()
    .join('')
}

/**
 * Indexes spread from the first highlight to the last. A long book then
 * contributes its beginning, middle, and end rather than only the latest page.
 */
export function evenIndexes(length: number, limit: number) {
  const count = Math.min(Math.max(length, 0), limit)
  const step = count > 1 ? (length - 1) / (count - 1) : 0
  return Array.from({ length: count }, (_, index) => Math.round(index * step))
}

export type SampledHighlight = {
  /** What the model cites. Short, so it cannot miscopy a database id. */
  ref: number
  id: number
  text: string
}

export function sampleHighlights(
  rows: readonly { id: number; content: string }[]
): SampledHighlight[] {
  const cleaned = rows
    .map(({ id, content }) => ({ id, text: content.trim() }))
    .filter(({ text }) => text)
  const indexes = evenIndexes(cleaned.length, BOOK_SUMMARY_SAMPLE)
  if (indexes.length === 0) return []
  const per = Math.min(
    BOOK_HIGHLIGHT_CHARS,
    Math.floor(BOOK_SUMMARY_CHARS / indexes.length)
  )
  return indexes.map((index, position) => ({
    ref: position + 1,
    id: cleaned[index].id,
    text: clipChars(cleaned[index].text, per),
  }))
}

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0
}

/**
 * A name the prompt can drop into "Write in …". Latin text stays unnamed:
 * English, French, and German share a script, and the model is told to follow
 * the highlights themselves.
 */
export function highlightLanguage(highlights: readonly string[]) {
  const text = highlights.join('\n')
  const hangul = countMatches(text, /\p{Script=Hangul}/gu)
  const kana = countMatches(text, /[\p{Script=Hiragana}\p{Script=Katakana}]/gu)
  const han = countMatches(text, /\p{Script=Han}/gu)
  const cyrillic = countMatches(text, /\p{Script=Cyrillic}/gu)
  const arabic = countMatches(text, /\p{Script=Arabic}/gu)
  const latin = countMatches(text, /\p{Script=Latin}/gu)
  // A little kana is a name or a quotation. Enough kana beside kanji is Japanese.
  const japanese = kana >= 2 && kana * 5 >= han
  const [top] = (
    [
      ['Korean', hangul],
      ['Japanese', japanese ? kana + han : kana],
      ['Chinese', japanese ? 0 : han],
      ['Russian', cyrillic],
      ['Arabic', arabic],
    ] as const
  ).toSorted((a, b) => b[1] - a[1])
  const identified = hangul + kana + han + cyrillic + arabic
  if (top[1] === 0 || top[1] * 2 < identified + latin)
    return 'the language of the highlights'
  return top[0]
}
