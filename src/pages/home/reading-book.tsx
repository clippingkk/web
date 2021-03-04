import { Link } from '@reach/router'
import React from 'react'
import BookInfo from '../../components/book-info/book-info'
import ClippingContent from '../../components/clipping-content'
import { useSingleBook } from '../../hooks/book'
import { books_me_recents } from '../../schema/__generated__/books'
import { WenquBook } from '../../services/wenqu'

type ReadingBookProps = {
  uid: number
  clipping: books_me_recents
}

function ReadingBook(props: ReadingBookProps) {
  const book = useSingleBook(props.clipping.bookID)
  if (!book) {
    return null
  }
  return (
    <div className='mb-4'>
      <BookInfo book={book} />
      <Link
        to={`/dash/${props.uid}/clippings/${props.clipping.id}`}
        className='font-lxgw text-3xl leading-loose from-yellow-100 to-yellow-200 bg-gradient-to-br rounded-lg p-8 block hover:shadow-xl m-4 transform hover:scale-x-105 duration-300 dark:from-purple-600 dark:to-purple-800 dark:text-gray-200'
      >
        <ClippingContent content={props.clipping.content} />
      </Link>
    </div>
  )
}

export default ReadingBook
