import React from 'react'
import { IBook } from '../../services/books';
import NoContentAlert from './no-content';
import BookCover from '../../components/book-cover/book-cover';
import { books_books } from '../../schema/__generated__/books';
import { useMultipBook } from '../../hooks/book';

type TBooksProps = {
  list: readonly books_books[],
  userid: number
}

function BooksContent(props: TBooksProps) {

  const books = useMultipBook(props.list.map(x => x.doubanId))

  if (books.length === 0) {
    return <NoContentAlert userid={props.userid} />
  }

  return (
    <React.Fragment>
      {books.map((item, index) => (
        <BookCover book={item} userid={props.userid} key={index} />
      ))}
    </React.Fragment>
  )
}

export default BooksContent
