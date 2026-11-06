/** A title with case, spacing and punctuation folded away, for matching. */
export function bookKey(title: string) {
  return title
    .split(/[(（]/)[0]
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
}

/**
 * A catalogue title without its bracketed edition notes and sales copy, which
 * can run to several sentences. A title that opens with a bracket stays whole.
 */
export function shortBookTitle(title: string) {
  return title.split(/[(（]/)[0].trim() || title
}

function looselyEqual(a: string, b: string) {
  // Kindle titles often carry a subtitle Douban files separately.
  const [short, long] = a.length < b.length ? [a, b] : [b, a]
  return short.length >= 2 && long.includes(short)
}

type SearchableBook = {
  title: string
  originTitle?: string
  author?: string
}

/** The first book filed under this title. A loose search can rank another book first. */
export function findBookByTitle<TBook extends SearchableBook>(
  title: string,
  books: readonly TBook[]
) {
  const wanted = bookKey(title)
  return books.find((book) =>
    [book.title, book.originTitle].some((name) =>
      looselyEqual(bookKey(name ?? ''), wanted)
    )
  )
}

/**
 * The book a recommendation means, or nothing. The author must agree too:
 * a short title matches many books, and a plain cover beats the wrong one.
 */
export function findRecommendedBook<TBook extends SearchableBook>(
  pick: { title: string; author: string },
  books: readonly TBook[]
) {
  const author = bookKey(pick.author)
  return findBookByTitle(
    pick.title,
    books.filter((book) => looselyEqual(bookKey(book.author ?? ''), author))
  )
}
