import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import BookInfo from '@/components/book-info/book-info'
import ClippingContent from '@/components/clipping-content'
import type { Clipping } from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'
import type { WenquBook } from '@/services/wenqu'

type ReadingBookProps = {
  uid: number
  book: WenquBook
  clipping?: Pick<Clipping, 'id' | 'bookID' | 'content'>
}

function ReadingBook({ clipping, book, uid }: ReadingBookProps) {
  if (!book) {
    return null
  }

  return (
    <div className="mx-auto mt-24 mb-12 w-full max-w-7xl">
      <BookInfo book={book} uid={uid} />

      {clipping && (
        <div className="mt-4">
          <Link
            href={`/dash/${uid}/clippings/${clipping.id}?iac=${IN_APP_CHANNEL.clippingFromBook}`}
            className="group relative block overflow-hidden rounded-2xl backdrop-blur-md"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 -z-10 transform bg-gradient-to-br from-amber-50/80 via-amber-100/70 to-amber-200/60 transition-all duration-500 group-hover:scale-105 dark:from-purple-900/80 dark:via-purple-800/70 dark:to-purple-700/60"></div>
            <div className="absolute -right-8 -bottom-8 -z-10 h-64 w-64 transform rounded-full bg-gradient-to-br from-amber-200/40 to-amber-300/30 blur-2xl transition-all duration-500 group-hover:scale-110 dark:from-purple-600/40 dark:to-purple-700/30"></div>

            <div className="relative p-8 sm:p-10">
              {/* Featured clipping content */}
              <ClippingContent
                content={clipping.content}
                className="font-lxgw text-xl text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100"
                showQuoteIcon={true}
                maxLines={3}
              />

              {/* Read more indicator */}
              <div className="mt-6 flex transform items-center justify-end font-medium text-amber-700 transition-all duration-300 group-hover:translate-x-2 dark:text-purple-300">
                <span className="mr-2">Read more</span>
                <ArrowRight size={18} />
              </div>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute right-0 bottom-0 left-0 -z-5 h-16 bg-gradient-to-t from-amber-100/80 to-transparent dark:from-purple-800/80"></div>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ReadingBook
