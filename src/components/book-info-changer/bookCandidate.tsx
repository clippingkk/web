import React from 'react'
import Image from 'next/image'
import { WenquBook } from '../../services/wenqu'

type BookCandidateProps = {
  book: WenquBook
  selected: boolean
  onSelecte: (book: WenquBook) => void
}

function BookCandidate(props: BookCandidateProps) {
  const { book, selected } = props
  return (
    <div
     className={'rounded flex p-2 cursor-pointer hover:shadow hover:bg-gray-300 transition-colors duration-150 ' + (selected ? 'shadow bg-gray-300' : '') }
     onClick={() => props.onSelecte(book)}
     >
      <Image
        src={book.image}
        height={192}
        width={135}
        alt={book.title}
        className='rounded'
      />
      <div className='ml-4 w-144'>
        <h3 className='text-3xl'>{book.title}</h3>
        <h4 className='text-lg'>{book.originTitle}</h4>
        <h4 className='text-sm'>{book.author}</h4>
        <h5>{book.press}</h5>
        <p className='line-clamp-5'>{book.summary}</p>
      </div>
    </div>
  )
}

export default BookCandidate
