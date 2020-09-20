import React from 'react'
import { IBook } from '../../services/books';
import NoContentAlert from './no-content';
import BookCover from '../../components/book-cover/book-cover';
import { books_books } from '../../schema/__generated__/books';

type TBooksProps = {
  list: readonly books_books[],
  userid: number
}

function BooksContent(props: TBooksProps) {
  if (props.list.length === 0) {
    return <NoContentAlert userid={props.userid} />
  }

  return (
    <React.Fragment>
      {props.list.map((item, index) => (
        <BookCover bookId={item.doubanId} userid={props.userid} key={index} />
      ))}
    </React.Fragment>
  )
}

export default BooksContent
