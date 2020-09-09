import React from 'react'
import { HideUntilLoaded } from '@nearform/react-animation'
import { IHttpBook, covertHttpBook2Book } from '../../services/books'
import { useSingleBook } from 'src/hooks/book'

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
    <div>
      <h2 className='text-3xl text-center font-bold my-8'>大家在读</h2>
      <div className='flex py-8 md:px-12 flex-wrap justify-center items-center'>
        {localBooks.map(b => (
          <HideUntilLoaded
            imageToLoad={b.image}
            key={b.id}
          >
            <div className={'relative mx-8 mb-8 transition-all duration-300 rounded transform hover:scale-110 shadow-2xl ' + styles.item}>
              <img src={b.image} className={'object-cover rounded ' + styles['book-image']} />
              <div className={'absolute bottom-0 left-0 w-full py-8 px-4 text-white rounded-b ' + styles['book-info']}>
                <h2 className='text-2xl text-right'>{b.title}</h2>
                <h3 className='text-sm italic text-right'>{b.author}</h3>
              </div>
            </div>
          </HideUntilLoaded>
        ))}
      </div>
    </div>
  )
}

export default TopBooks
