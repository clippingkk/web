import { Link } from '@reach/router'
import React from 'react'
import BookInfo from '../../components/book-info/book-info'
import { useSingleBook } from '../../hooks/book'
import { books_me_recents } from '../../schema/__generated__/books'
import { WenquBook } from '../../services/wenqu'

type ReadingBookProps = {
  uid: number
  clipping: books_me_recents
}

function ReadingBook(props: ReadingBookProps) {
  const book = useSingleBook(props.clipping.bookID)
  if (!book) {
    return null
  }
  return (
    <div>
      <BookInfo book={book} />
      <Link to={`/dash/${props.uid}/clippings/${props.clipping.id}`}>
        <p>{props.clipping.content}</p>
      </Link>
    </div>
  )
}

export default ReadingBook
