import React from 'react'
import { IBook } from '../../services/books';
import NoContentAlert from './no-content';
import BookCover from '../../components/book-cover/book-cover';
const styles = require('./books.css')

type TBooksProps = {
  list: IBook[],
  userid: number
}

function BooksContent(props: TBooksProps) {
  if (props.list.length === 0) {
    return <NoContentAlert userid={props.userid} />
  }

  const list = props.list.map((item: IBook) => (
    <BookCover book={item} userid={props.userid} />
  ))

  return (
    <React.Fragment>
      {list}
    </React.Fragment>
  )
}

export default BooksContent
