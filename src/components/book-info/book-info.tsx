import React from 'react'
import { HideUntilLoaded } from '@nearform/react-animation'
import { IBook, searchBookDetail, getBookClippings } from '../../services/books';
import Card from '../card/card';
import { WenquBook } from '../../services/wenqu'
const styles = require('./book-info.css').default

type TBookInfoProp = {
  book: WenquBook
}

function BookInfo({ book }: TBookInfoProp) {
  return (
      <Card className='mt-20 flex p-12 bg-blue-200 bg-opacity-50 flex-col md:flex-row'>
        <div className='mr-12'>
          <HideUntilLoaded
            imageToLoad={book.image}
          >
            <img src={book.image} className={styles.image + ' shadow rounded mr-4'} />
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
