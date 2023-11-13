import React from 'react'
import Link from 'next/link'
import BookInfo from '../../../../components/book-info/book-info'
import ClippingContent from '../../../../components/clipping-content'
import { useSingleBook } from '../../../../hooks/book'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { Clipping } from '../../../../schema/generated'

type ReadingBookProps = {
  uid: number
  clipping: Pick<Clipping, 'id' | 'bookID' | 'content'>
}

function ReadingBook(props: ReadingBookProps) {
  const book = useSingleBook(props.clipping.bookID)
  if (!book) {
    return null
  }
  return (
    <div className='mb-4'>
      <BookInfo book={book} uid={props.uid} />
      <Link
        href={`/dash/${props.uid}/clippings/${props.clipping.id}?iac=${IN_APP_CHANNEL.clippingFromBook}`}
        className='font-lxgw text-3xl leading-loose from-yellow-100 to-yellow-200 bg-gradient-to-br rounded-lg p-8 block hover:shadow-xl m-4 transform hover:scale-x-105 duration-150 dark:from-purple-600 dark:to-purple-800 dark:text-gray-200 active:scale-95'>

        <ClippingContent content={props.clipping.content} />

      </Link>
    </div>
  );
}

export default ReadingBook
