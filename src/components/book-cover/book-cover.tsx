import React from 'react'
import { WenquBook } from '../../services/wenqu';
import styles from './book-cover.module.css'
import HideUntilLoaded from '../SimpleAnimation/HideUntilLoaded';
import Link from 'next/link'
import Image from 'next/image'

type TBookCoverProps = {
  book: WenquBook
  domain: string
}

function BookCover({ book, domain }: TBookCoverProps) {
  if (!book) {
    return null
  }

  return (
    <Link
      href={`/dash/${domain}/book/${book.doubanId}`}
    >
      <a
        className={styles.cover + ' bg-transparent flex flex-col items-center content-center transition-all duration-300 rounded hover:bg-opacity-75 hover:bg-gray-300 hover:shadow-lg animate__fadeInDown w-128 h-156 overflow-visible'}
      >

        <HideUntilLoaded
          imageToLoad={book.image}
        >
          {/* <Image
            src={book.image}
            className={styles.image + ' rounded shadow-lg duration-300 transition-transform overflow-visible'}
            width={300}
            height={350}
            alt={book.title}
          /> */}
          <img
            src={book.image}
            className={styles.image + ' rounded shadow-lg duration-300 transition-transform w-72 h-96 overflow-visible'}
            // width={300}
            // height={350}
            alt={book.title}
          />
        </HideUntilLoaded>
        <div className='flex-col flex content-center items-center mt-4'>
          <h3 className='m-0 dark:text-gray-200'>{book.title}</h3>
          <h5 className='my-4 mx-0 dark:text-gray-500'>{book.author}</h5>
        </div>
      </a>
    </Link>
  )
}

export default BookCover
