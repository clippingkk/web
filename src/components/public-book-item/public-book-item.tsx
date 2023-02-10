import React from 'react'
import { WenquBook } from '../../services/wenqu'
import HideUntilLoaded from '../SimpleAnimation/HideUntilLoaded'
import styles from './style.module.css'

type PublicBookItemProps = {
  book: WenquBook
}

function PublicBookItem(props: PublicBookItemProps) {
  const book = props.book
  return (
    <HideUntilLoaded
      imageToLoad={book.image}
      key={book.id}
    >
      <div className={'relative mx-8 mb-8 transition-all duration-300 rounded transform hover:scale-110 shadow-2xl with-slide-in'}>
        <img
          src={book.image}
          className='object-cover rounded w-72 h-96'
        />
        <div className={'absolute bottom-0 left-0 w-full py-8 px-4 text-white rounded-b ' + styles['book-info']}>
          <h2 className='text-2xl text-right'>{book.title}</h2>
          <h3 className='text-sm italic text-right line-clamp-2'>{book.author}</h3>
        </div>
      </div>
    </HideUntilLoaded>
  )
}

export default PublicBookItem
