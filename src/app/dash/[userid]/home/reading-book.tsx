import React from 'react'
import Link from 'next/link'
import BookInfo from '../../../../components/book-info/book-info'
import ClippingContent from '../../../../components/clipping-content'
import { useSingleBook, useSingleBookSuspense } from '../../../../hooks/book'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { Clipping } from '../../../../schema/generated'

type ReadingBookProps = {
  uid: number
  bookId: string
  clipping?: Pick<Clipping, 'id' | 'bookID' | 'content'>
}

function ReadingBook(props: ReadingBookProps) {
  const { clipping, bookId, uid } = props
  const book = useSingleBookSuspense(bookId)
  if (!book) {
    return null
  }
  return (
    <div className='mb-4'>
      <BookInfo book={book} uid={uid} />
      {clipping && (
        <Link
          href={`/dash/${uid}/clippings/${clipping.id}?iac=${IN_APP_CHANNEL.clippingFromBook}`}
          className='font-lxgw text-3xl leading-loose from-yellow-100 to-yellow-200 bg-gradient-to-br rounded-lg p-8 block hover:shadow-xl m-4 transform hover:scale-x-105 duration-150 dark:from-purple-600 dark:to-purple-800 dark:text-gray-200 active:scale-95'>

          <ClippingContent content={clipping.content} />
        </Link>
      )}
    </div>
  );
}

export default ReadingBook
