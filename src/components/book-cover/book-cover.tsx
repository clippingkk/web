import React from 'react'
import { Link } from '@reach/router';
import { HideUntilLoaded } from '@nearform/react-animation'
import { useSingleBook } from '../../hooks/book'
import { WenquBook } from '../../services/wenqu';
const styles = require('./book-cover.css')

type TBookCoverProps = {
  book: WenquBook
  userid: number
}

function BookCover({ book, userid }: TBookCoverProps) {
  if (!book) {
    return null
  }

  return (
    <Link to={`/dash/${userid}/book/${book.doubanId}`} className={styles.cover + ' bg-transparent flex flex-col items-center content-center transition-all duration-300 rounded hover:bg-opacity-75 hover:bg-gray-300 shadow-lg animate__fadeInDown'}>
      <HideUntilLoaded
        imageToLoad={book.image}
      >
        <img src={book.image} className={styles.image} />
      </HideUntilLoaded>
      <div className='flex-col flex content-center items-center mt-4'>
        <h3 className='m-0 dark:text-gray-200'>{book.title}</h3>
        <h5 className='my-4 mx-0 dark:text-gray-500'>{book.author}</h5>
      </div>
    </Link>
  )
}

export default BookCover
