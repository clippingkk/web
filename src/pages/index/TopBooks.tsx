import React from 'react'
import { IHttpBook, covertHttpBook2Book } from '../../services/books'

const styles = require('./tops.css')

type TopBooksProps = {
  books?: IHttpBook[]
}

function TopBooks(props: TopBooksProps) {
  if (!props.books) {
    return null
  }

  const localBooks = props.books.map(covertHttpBook2Book)
  return (
    <div className='flex py-8 md:px-12 flex-wrap justify-center items-center'>
      {localBooks.map(b => (
        <div className={'relative mx-8 mb-8 transition-all duration-300 ' + styles.item} key={b.id}>
          <img src={b.image} className=' h-1/3 w-2/5 object-cover' />
          <div className='absolute bottom-0 left-0 w-full'>
            <h2 className='text-2xl'>{b.title}</h2>
            <h3 className='text-sm italic'>{b.author}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TopBooks
