import React from 'react'
import { WenquBook } from '../../services/wenqu';
import HideUntilLoaded from '../SimpleAnimation/HideUntilLoaded';
import Link from 'next/link'
import BlurhashView from '@annatarhe/blurhash-react';
import styles from './book-cover.module.css'

type TBookCoverProps = {
  book: WenquBook
  domain: string
}

function BookCover({ book, domain }: TBookCoverProps) {
  return (
    <Link
      href={`/dash/${domain}/book/${book.doubanId}`}
      className={styles.cover + ' bg-transparent flex flex-col items-center content-center rounded active:scale-95 w-128 overflow-visible font-lxgw with-slide-in'}>
      <BlurhashView
        blurhashValue={book.edges?.imageInfo?.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
        src={book.image}
        height={384}
        width={320}
        className={styles.image + ' rounded-sm shadow-2xl duration-300 transition-transform w-72 h-96'}
        alt={book.title}
      />
      <div className='flex-col flex content-center items-center mt-4'>
        <h3 className='m-0 dark:text-gray-200 text-center'>{book.title}</h3>
        <h5 className='my-4 mx-0 dark:text-gray-500'>{book.author}</h5>
      </div>
    </Link>
  );
}

export default BookCover
