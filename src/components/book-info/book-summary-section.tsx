import { useTranslation } from "@/i18n/client"
import { WenquBook } from "@/services/wenqu"
import { useState } from "react"

type Props = {
  book: WenquBook
}

function BookSummarySection({ book }: Props) {
  const { t } = useTranslation()
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  return (
    <div className="mt-8 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-6 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Summary</h3>
        {book.summary && book.summary.length > 300 && (
          <button
            onClick={() => setSummaryExpanded(prev => !prev)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            {summaryExpanded ? t('app.common.showLess') : t('app.common.showMore')}
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${summaryExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      <div className="relative overflow-hidden">
        <p
          className={`text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line ${!summaryExpanded && book.summary && book.summary.length > 300 ? 'line-clamp-5' : ''}`}
        >
          {book.summary}
        </p>
        {!summaryExpanded && book.summary && book.summary.length > 300 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 dark:from-gray-800/90 to-transparent pointer-events-none"></div>
        )}
      </div>
    </div>
  )
}

export default BookSummarySection
