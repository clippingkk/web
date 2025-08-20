import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
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
    <div className="mb-12 mt-24 w-full max-w-7xl mx-auto">
      <BookInfo book={book} uid={uid} />

      {clipping && (
        <div className="mt-4">
          <Link
            href={`/dash/${uid}/clippings/${clipping.id}?iac=${IN_APP_CHANNEL.clippingFromBook}`}
            className="group relative overflow-hidden block rounded-2xl backdrop-blur-md"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-amber-100/70 to-amber-200/60 dark:from-purple-900/80 dark:via-purple-800/70 dark:to-purple-700/60 -z-10 transform transition-all duration-500 group-hover:scale-105"></div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-gradient-to-br from-amber-200/40 to-amber-300/30 dark:from-purple-600/40 dark:to-purple-700/30 rounded-full blur-2xl -z-10 transform transition-all duration-500 group-hover:scale-110"></div>

            <div className="p-8 sm:p-10 relative">
              {/* Featured clipping content */}
              <ClippingContent
                content={clipping.content}
                className="text-slate-800 dark:text-slate-100 text-xl sm:text-2xl md:text-3xl font-lxgw"
                showQuoteIcon={true}
                maxLines={3}
              />

              {/* Read more indicator */}
              <div className="mt-6 flex justify-end items-center text-amber-700 dark:text-purple-300 font-medium transform transition-all duration-300 group-hover:translate-x-2">
                <span className="mr-2">Read more</span>
                <ArrowRight size={18} />
              </div>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-100/80 to-transparent dark:from-purple-800/80 -z-5"></div>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ReadingBook
