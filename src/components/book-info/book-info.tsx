import React from 'react'
import { HideUntilLoaded } from '@nearform/react-animation'
import { IBook, searchBookDetail, getBookClippings } from '../../services/books';
import Card from '../card/card';
import { WenquBook } from '../../services/wenqu'
const styles = require('./book-info.css')

type TBookInfoProp = {
  book: WenquBook
}

function BookInfo({ book }: TBookInfoProp) {
  return (
      <Card className={styles.book}>
        <div className={styles.imageContainer}>
          <HideUntilLoaded
            imageToLoad={book.image}
          >
            <img src={book.image} className={styles.image + ' mr-4'} />
          </HideUntilLoaded>
        </div>

        <div className={styles.info}>
          <h2 className='my-4 text-4xl font-bold'>{book.title}</h2>
          <h5 className='my-4 text-2xl'>{book.author}</h5>
          <p className='font-light leading-relaxed text-lg'>{book.summary}</p>
        </div>
      </Card>
  )
}

export default BookInfo
