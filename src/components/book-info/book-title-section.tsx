import { useTranslation } from '@/i18n/client'
import { WenquBook } from '@/services/wenqu'
import { Clock, Star } from 'lucide-react'

type Props = {
  book: WenquBook
  duration?: number
}

function BookTitleSection({ book, duration }: Props) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 inline-block text-transparent bg-clip-text">
          {book.title}
        </h1>

        <div className="flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-gray-800 dark:text-gray-200">{book.rating.toFixed(1)}/10</span>
        </div>
      </div>

      {/* Author and publication info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-semibold">{book.author}</h2>
          {book.press && (
            <span className="text-sm opacity-75">· {book.press}</span>
          )}
        </div>

        {/* Reading stats */}
        {duration && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{t('app.book.readingDuration', { count: duration })}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookTitleSection
