import React from 'react'
import { Link } from '@reach/router';
import { HideUntilLoaded } from '@nearform/react-animation'
import { IBook } from '../../services/books';
const styles = require('./book-cover.css')

type TBookCoverProps = {
  book: IBook
  userid: number
}

function BookCover({ book, userid }: TBookCoverProps) {
  return (
    <Link to={`/dash/${userid}/book/${book.doubanId}`} className={styles.cover}>
      <HideUntilLoaded
        imageToLoad={book.image}
      >
        <img src={book.image} className={styles.image} />
      </HideUntilLoaded>
      <div className={styles.info}>
        <h3 className={styles.title}>{book.title}</h3>
        <h5 className={styles.author}>{book.author}</h5>
      </div>
    </Link>
  )
}

export default BookCover
