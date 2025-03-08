import { WenquBook } from '@/services/wenqu'
import { Calendar, BookOpen } from 'lucide-react'

type Props = {
  book: WenquBook
}

function BookMetaSection({ book }: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {book.pubdate && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400">Published</h3>
            <p className="font-medium text-gray-800 dark:text-gray-200">{book.pubdate}</p>
          </div>
        </div>
      )}

      {book.totalPages > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400">Pages</h3>
            <p className="font-medium text-gray-800 dark:text-gray-200">{book.totalPages}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookMetaSection
