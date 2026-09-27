'use client'

import { useApolloClient } from '@apollo/client/react'
import { useCallback, useState } from 'react'

import BookCard from '@/components/book/book-card'
import LoadMoreFooter from '@/components/list/load-more-footer'
import { LibraryBooksDocument, type LibraryBooksQuery } from '@/gql/graphql'
import { useMultipleBook } from '@/hooks/book'
import { bookHref } from '@/utils/profile.utils'

export type ShelfBook = LibraryBooksQuery['books'][number]

type LibraryShelfProps = {
  uid: number
  slug: string
  initialBooks: ShelfBook[]
  pageSize: number
}

function LibraryShelf(props: LibraryShelfProps) {
  const { uid, slug, initialBooks, pageSize } = props
  const client = useApolloClient()
  const [books, setBooks] = useState(initialBooks)
  const [hasMore, setHasMore] = useState(initialBooks.length >= pageSize)
  const [loading, setLoading] = useState(false)

  const { books: covers } = useMultipleBook(books.map((b) => b.doubanId))
  const coverById = new Map(covers.map((b) => [String(b.doubanId), b]))

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const { data } = await client.query({
        query: LibraryBooksDocument,
        variables: {
          uid,
          pagination: { limit: pageSize, offset: books.length },
        },
        fetchPolicy: 'network-only',
      })
      const next = data?.books ?? []
      setBooks((current) => {
        const seen = new Set(current.map((b) => b.doubanId))
        return [...current, ...next.filter((b) => !seen.has(b.doubanId))]
      })
      setHasMore(next.length >= pageSize)
    } finally {
      setLoading(false)
    }
  }, [client, uid, pageSize, books.length, loading, hasMore])

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {books.map((book) => (
          <li key={book.doubanId}>
            <BookCard
              href={bookHref(slug, book.doubanId)}
              doubanId={book.doubanId}
              book={coverById.get(book.doubanId)}
              clippingsCount={book.clippingsCount}
              lastReadingAt={book.lastReadingAt}
            />
          </li>
        ))}
      </ul>
      <LoadMoreFooter
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        showEnd={books.length > pageSize}
      />
    </>
  )
}

export default LibraryShelf
