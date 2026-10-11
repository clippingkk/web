// East Asian wide characters (CJK punctuation, kana, ideographs, Hangul and
// full-width forms) take about two Latin letters of width on the poster.
const WIDE = /[⺀-鿿가-힯豈-﫿＀-￯]/

export const NOTE_MAX_LENGTH = 280
export const HIGHLIGHT_COUNT = 3
/** Width units a highlight may take on the book poster before it is cut. */
export const HIGHLIGHT_WIDTH = 200

function charWidth(character: string) {
  return WIDE.test(character) ? 2 : 1
}

export function textWidth(text: string) {
  return Array.from(text).reduce((sum, ch) => sum + charWidth(ch), 0)
}

/**
 * Collapse whitespace and cut the text to `max` width units, ending with an
 * ellipsis. Latin text is cut at the last space rather than mid-word.
 */
export function excerpt(text: string, max: number) {
  const characters = Array.from(text.replace(/\s+/g, ' ').trim())
  let width = 0
  for (let index = 0; index < characters.length; index++) {
    width += charWidth(characters[index])
    if (width <= max) continue
    let end = index
    const space = characters.lastIndexOf(' ', index)
    if (!WIDE.test(characters[index]) && space > 0 && index - space < 16) {
      end = space
    }
    const kept = characters.slice(0, end).join('')
    return `${kept.replace(/[\s\p{P}]+$/u, '')}…`
  }
  return characters.join('')
}

/** Keep a note's own line breaks, but not runs of blank lines. */
export function tidyNote(note: string) {
  return note.trim().replace(/\n{3,}/g, '\n\n')
}

type Candidate = { id: number; content: string; visible: boolean }

function shuffled<T>(items: T[], random: () => number) {
  const deck = [...items]
  for (let index = deck.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1))
    ;[deck[index], deck[swap]] = [deck[swap], deck[index]]
  }
  return deck
}

/**
 * Pick public highlights for a share poster. A share image is public, so
 * private clippings never qualify. Highlights that fit the poster without
 * being cut come first, and when shuffling, ones not on the poster yet.
 */
export function pickHighlights<T extends Candidate>(
  pool: readonly T[],
  {
    count = HIGHLIGHT_COUNT,
    exclude = [],
    random = Math.random,
  }: {
    count?: number
    exclude?: readonly number[]
    random?: () => number
  } = {}
): T[] {
  const buckets: T[][] = [[], [], [], []]
  for (const clipping of pool) {
    if (!clipping.visible || !clipping.content.trim()) continue
    const width = textWidth(clipping.content.trim())
    const fits = width >= 16 && width <= HIGHLIGHT_WIDTH
    const seen = exclude.includes(clipping.id)
    buckets[(seen ? 2 : 0) + (fits ? 0 : 1)].push(clipping)
  }
  return buckets.flatMap((bucket) => shuffled(bucket, random)).slice(0, count)
}

/** Shareable highlights in the pool, i.e. what `pickHighlights` can choose from. */
export function countShareable(pool: readonly Candidate[]) {
  return pool.filter((clipping) => clipping.visible && clipping.content.trim())
    .length
}

/**
 * A random page of `limit` clippings within `total`, so a long book samples
 * beyond its newest highlights.
 */
export function randomWindow(
  total: number,
  limit: number,
  random = Math.random
) {
  const span = Math.max(0, total - limit)
  return { limit, offset: Math.floor(random() * (span + 1)) }
}
