'use client'

import { Bookmark, CalendarRange, Clock } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import dayjs from '@/utils/dayjs'

type Props = {
  clippingsCount?: number
  duration?: number
  startReadingAt?: string
  lastReadingAt?: string
}

function BookStatsBar({
  clippingsCount,
  duration,
  startReadingAt,
  lastReadingAt,
}: Props) {
  const { t } = useTranslation()

  const hasDateRange = startReadingAt && lastReadingAt

  return (
    <div className='flex flex-wrap gap-3'>
      {clippingsCount != null && clippingsCount > 0 && (
        <div className='flex items-center gap-3 rounded-xl border border-blue-200/40 bg-white/40 px-4 py-3 backdrop-blur-sm dark:border-blue-800/40 dark:bg-zinc-800/40'>
          <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30'>
            <Bookmark className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <p className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
              {clippingsCount}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('app.book.highlights')}
            </p>
          </div>
        </div>
      )}

      {duration != null && duration > 0 && (
        <div className='flex items-center gap-3 rounded-xl border border-green-200/40 bg-white/40 px-4 py-3 backdrop-blur-sm dark:border-green-800/40 dark:bg-zinc-800/40'>
          <div className='rounded-lg bg-green-100 p-2 dark:bg-green-900/30'>
            <Clock className='h-4 w-4 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <p className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
              {duration}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('app.book.readingDays')}
            </p>
          </div>
        </div>
      )}

      {hasDateRange && (
        <div className='flex items-center gap-3 rounded-xl border border-purple-200/40 bg-white/40 px-4 py-3 backdrop-blur-sm dark:border-purple-800/40 dark:bg-zinc-800/40'>
          <div className='rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30'>
            <CalendarRange className='h-4 w-4 text-purple-600 dark:text-purple-400' />
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
              {dayjs(startReadingAt).format('YYYY/MM/DD')} –{' '}
              {dayjs(lastReadingAt).format('YYYY/MM/DD')}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('app.book.readingPeriod')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookStatsBar
