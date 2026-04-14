import { Star } from 'lucide-react'

import type { WenquBook } from '@/services/wenqu'

type Props = {
  book: WenquBook
}

function BookTitleSection({ book }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.34em] text-slate-400 uppercase dark:text-slate-500">
            Reading now
          </p>
          <h1 className="bg-gradient-to-r from-slate-950 via-cyan-800 to-sky-600 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-5xl lg:text-6xl dark:from-white dark:via-cyan-100 dark:to-sky-300">
            {book.title}
          </h1>

          {book.originTitle && book.originTitle !== book.title && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {book.originTitle}
            </p>
          )}
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/85 px-4 py-2 text-sm shadow-sm backdrop-blur-sm dark:border-amber-400/20 dark:bg-slate-900/70">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {book.rating?.toFixed(1)}/10
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-slate-700 dark:text-slate-300">
          <h2 className="text-xl font-semibold md:text-2xl">{book.author}</h2>
          {book.press && (
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
              {book.press}
            </span>
          )}
        </div>

        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {book.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-slate-600 uppercase shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300"
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
