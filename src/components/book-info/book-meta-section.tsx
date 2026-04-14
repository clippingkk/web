import { BookOpen, Calendar } from 'lucide-react'

import type { WenquBook } from '@/services/wenqu'
import dayjs from '@/utils/dayjs'

type Props = {
  book: WenquBook
  publishedLabel: string
  pagesLabel: string
}

function BookMetaSection({ book, publishedLabel, pagesLabel }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {book.pubdate && (
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/78 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
          <div className="rounded-2xl bg-cyan-50 p-3 dark:bg-cyan-500/12">
            <Calendar className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
          </div>
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase dark:text-slate-500">
              {publishedLabel}
            </h3>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {dayjs(book.pubdate).format('YYYY-MM-DD')}
            </p>
          </div>
        </div>
      )}

      {book.totalPages > 0 && (
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/78 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65">
          <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/12">
            <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase dark:text-slate-500">
              {pagesLabel}
            </h3>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {book.totalPages}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookMetaSection
