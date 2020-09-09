import React from 'react'
import { IBook } from '../../services/books';
import NoContentAlert from './no-content';
import BookCover from '../../components/book-cover/book-cover';

type TBooksProps = {
  list: IBook[],
  userid: number
}

function BooksContent(props: TBooksProps) {
  if (props.list.length === 0) {
    return <NoContentAlert userid={props.userid} />
  }

  return (
    <React.Fragment>
      {props.list.map((item: IBook) => (
        <BookCover bookId={item.doubanId} userid={props.userid} key={item.id} />
      ))}
    </React.Fragment>
  )
}

export default BooksContent
