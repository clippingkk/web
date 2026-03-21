import { Star } from 'lucide-react'

import type { WenquBook } from '@/services/wenqu'

type Props = {
  book: WenquBook
  duration?: number
}

function BookTitleSection({ book }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl lg:text-5xl dark:from-blue-400 dark:to-purple-400">
          {book.title}
        </h1>

        <div className="flex items-center gap-2 rounded-full bg-white/30 px-3 py-1.5 backdrop-blur-sm dark:bg-gray-800/30">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {book.rating?.toFixed(1)}/10
          </span>
        </div>
      </div>

      {/* Author and publication info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-semibold">{book.author}</h2>
          {book.press && (
            <span className="text-sm opacity-75">· {book.press}</span>
          )}
        </div>

        {/* Tags */}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {book.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200/60 bg-white/40 px-3 py-1 text-xs font-medium text-gray-600 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/40 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookTitleSection
