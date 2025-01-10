import React from 'react'
import BlurhashImage from '@annatarhe/blurhash-react'
import { WenquBook } from '../../services/wenqu'
import { Rating, Tooltip } from '@mantine/core'

type BookCandidateProps = {
  book: WenquBook
  selected: boolean
  onSelecte: (book: WenquBook) => void
}

function BookCandidate(props: BookCandidateProps) {
  const { book, selected } = props
  return (
    <div
      className={'rounded flex p-2 cursor-pointer hover:shadow hover:bg-slate-300 transition-colors duration-150 dark:hover:bg-slate-800 ' + (selected ? 'shadow bg-slate-300 dark:bg-slate-800' : '')}
      onClick={() => props.onSelecte(book)}
    >
      <BlurhashImage
        width={135}
        height={192}
        src={book.image}
        alt={book.title}
        className='rounded'
        blurhashValue={book.edges?.imageInfo?.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
      />
      <div className='ml-4 w-144'>
        <h3 className='text-3xl inline-block'>
          {book.title}
          <div className='inline-block'>
            <Tooltip label={`douban: ${book.rating}/10`}>
              <Rating readOnly value={book.rating / 2} />
            </Tooltip>
          </div>
        </h3>
        <h4 className='text-lg'>{book.originTitle}</h4>
        <h4 className='text-sm'>{book.author}</h4>
        <h5>{book.press}</h5>
        <p className='line-clamp-5'>{book.summary}</p>
      </div>
    </div>
  )
}

export default BookCandidate
