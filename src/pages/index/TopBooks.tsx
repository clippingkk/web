import React from 'react'
import { HideUntilLoaded } from '@nearform/react-animation'
import { IHttpBook, covertHttpBook2Book } from '../../services/books'
import { publicData_public, publicData_public_books } from '../../schema/__generated__/publicData'
import useSWR from 'swr'
import { WenquSearchResponse, wenquRequest } from '../../services/wenqu'
import { useSingleBook } from '../../hooks/book'

const styles = require('./tops.css')

type TopBooksProps = {
  books?: readonly publicData_public_books[] 
}

type localBookProps = {
  book: publicData_public_books
}

function LocalBook(props: localBookProps) {
  const book = useSingleBook(props.book.doubanId)

  if (!book) {
    return null
  }
  return (
    <HideUntilLoaded
      imageToLoad={book.image}
      key={book.id}
    >
      <div className={'relative mx-8 mb-8 transition-all duration-300 rounded transform hover:scale-110 shadow-2xl ' + styles.item}>
        <img src={book.image} className={'object-cover rounded ' + styles['book-image']} />
        <div className={'absolute bottom-0 left-0 w-full py-8 px-4 text-white rounded-b ' + styles['book-info']}>
          <h2 className='text-2xl text-right'>{book.title}</h2>
          <h3 className='text-sm italic text-right'>{book.author}</h3>
        </div>
      </div>
    </HideUntilLoaded>
  )
}

function TopBooks(props: TopBooksProps) {
  if (!props.books) {
    return null
  }

  return (
    <div>
      <h2 className='text-3xl text-center font-bold my-8'>大家在读</h2>
      <div className='flex py-8 md:px-12 flex-wrap justify-center items-center'>
        {props.books.map(b => <LocalBook book={b} />)}
      </div>
    </div>
  )
}

export default TopBooks
