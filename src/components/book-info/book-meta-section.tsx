'use client'

import { BookOpen, Calendar } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import type { WenquBook } from '@/services/wenqu'
import dayjs from '@/utils/dayjs'

type Props = {
  book: WenquBook
}

function BookMetaSection({ book }: Props) {
  const { t } = useTranslation(undefined, 'book')
  return (
    <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
      {book.pubdate && (
        <div className='flex items-center gap-3 rounded-xl border border-gray-100 bg-white/20 p-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/20'>
          <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30'>
            <Calendar className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <h3 className='text-xs text-gray-500 uppercase dark:text-gray-400'>
              {t('app.book.meta.published')}
            </h3>
            <p className='font-medium text-gray-800 dark:text-gray-200'>
              {dayjs(book.pubdate).format('YYYY-MM-DD')}
            </p>
          </div>
        </div>
      )}

      {book.totalPages > 0 && (
        <div className='flex items-center gap-3 rounded-xl border border-gray-100 bg-white/20 p-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/20'>
          <div className='rounded-lg bg-green-100 p-2 dark:bg-green-900/30'>
            <BookOpen className='h-5 w-5 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <h3 className='text-xs text-gray-500 uppercase dark:text-gray-400'>
              {t('app.book.meta.pages')}
            </h3>
            <p className='font-medium text-gray-800 dark:text-gray-200'>
              {book.totalPages}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookMetaSection
