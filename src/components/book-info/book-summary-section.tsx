import { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import type { WenquBook } from '@/services/wenqu'

type Props = {
  book: WenquBook
}

function BookSummarySection({ book }: Props) {
  const { t } = useTranslation(undefined, 'book')
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  return (
    <div className='mt-8 rounded-xl border border-gray-100 bg-white/20 p-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/20'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          {t('app.book.summary.title')}
        </h3>
        {book.summary && book.summary.length > 300 && (
          <button
            onClick={() => setSummaryExpanded((prev) => !prev)}
            className='flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
          >
            {summaryExpanded
              ? t('app.book.summary.showLess')
              : t('app.book.summary.showMore')}
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${summaryExpanded ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
        )}
      </div>
      <div className='relative overflow-hidden'>
        <p
          className={`leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300 ${!summaryExpanded && book.summary && book.summary.length > 300 ? 'line-clamp-5' : ''}`}
        >
          {book.summary}
        </p>
        {!summaryExpanded && book.summary && book.summary.length > 300 && (
          <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-800/90'></div>
        )}
      </div>
    </div>
  )
}

export default BookSummarySection
