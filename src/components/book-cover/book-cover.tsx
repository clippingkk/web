import BlurhashView from '@annatarhe/blurhash-react'
import Link from 'next/link'

import type { WenquBook } from '../../services/wenqu'

type TBookCoverProps = {
  book: WenquBook
  domain: string
}

function BookCover({ book, domain }: TBookCoverProps) {
  return (
    <Link
      href={`/dash/${domain}/book/${book.doubanId}`}
      className="font-lxgw with-slide-in group flex w-128 flex-col items-center overflow-visible rounded-sm bg-transparent active:scale-95"
    >
      <BlurhashView
        blurhashValue={
          book.edges?.imageInfo?.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
        }
        src={book.image}
        height={384}
        width={320}
        className="h-96 w-72 rounded-md shadow-xl shadow-blue-500/10 transition-transform duration-300 group-hover:-translate-y-8 group-hover:scale-[1.06] dark:shadow-black/40"
        alt={book.title}
      />
      <div className="mt-4 flex flex-col items-center">
        <h3 className="m-0 text-center text-slate-800 dark:text-slate-100">
          {book.title}
        </h3>
        <h5 className="mx-0 my-4 text-slate-600 dark:text-slate-300">
          {book.author}
        </h5>
      </div>
    </Link>
  )
}

export default BookCover
