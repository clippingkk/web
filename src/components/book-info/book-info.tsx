import React from 'react'
import { HideUntilLoaded } from '@nearform/react-animation'
import { IBook, searchBookDetail, getBookClippings } from '../../services/books';
import Card from '../card/card';
const styles = require('./book-info.css')

type TBookInfoProp = {
  book: IBook
}

function BookInfo({ book }: TBookInfoProp) {
  return (
      <Card className={styles.book}>
        <div className={styles.imageContainer}>
          <HideUntilLoaded
            imageToLoad={book.image}
          >
            <img src={book.image} className={styles.image} />
          </HideUntilLoaded>
        </div>

        <div className={styles.info}>
          <h2 className={styles.title}>{book.title}</h2>
          <h5 className={styles.author}>{book.author}</h5>
          <p className={styles.summary}>{book.summary}</p>
        </div>
      </Card>
  )
}

export default BookInfo
