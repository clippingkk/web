import React from 'react'
import { Link } from '@reach/router';
import { HideUntilLoaded } from '@nearform/react-animation'
import { useSingleBook } from '../../hooks/book'
const styles = require('./book-cover.css')

type TBookCoverProps = {
  bookId: string
  userid: number
}

function BookCover({ bookId, userid }: TBookCoverProps) {
  const book = useSingleBook(bookId)

  if (!book) {
    return null
  }

  return (
    <Link to={`/dash/${userid}/book/${book.doubanId}`} className={styles.cover + ' animate__fadeInDown'}>
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
