'use client'
import { useTranslation } from '@/i18n/client'
import { Share2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { WenquBook } from '../../services/wenqu'
import BookSharePreview from '../preview/preview-book'
import BookCoverColumn from './book-cover-column'
import BookMetaSection from './book-meta-section'
import BookSummarySection from './book-summary-section'
import BookTitleSection from './book-title-section'

type TBookInfoProp = {
  uid: number
  book: WenquBook
  duration?: number
  isLastReadingBook?: boolean
}

function BookInfo({ book, uid, duration }: TBookInfoProp) {
  const { t } = useTranslation()
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible((v) => !v)
  }, [])
  return (
    <div className="relative mt-16 w-full md:mt-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/30 via-white/20 to-white/5 backdrop-blur-lg dark:from-gray-800/30 dark:via-gray-800/20 dark:to-gray-900/5"></div>

      {/* Main content container */}
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-gray-200 bg-gradient-to-br from-white/70 via-white/60 to-white/40 shadow-xl backdrop-blur-lg dark:border-gray-700 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40">
        {/* Book content grid */}
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Book cover column */}
          <BookCoverColumn
            book={book}
            togglePreviewVisible={togglePreviewVisible}
          />

          {/* Book details column */}
          <div className="font-lxgw md:col-span-2 lg:col-span-3">
            {/* Title and rating */}
            <BookTitleSection book={book} duration={duration} />

            {/* Action buttons (desktop) */}
            <div className="mt-6 hidden gap-4 md:flex">
              <button
                onClick={() => togglePreviewVisible()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
              >
                <Share2 className="h-4 w-4" />
                <span>{t('app.book.share')}</span>
              </button>
            </div>

            {/* Book metadata */}
            <BookMetaSection book={book} />

            {/* Book summary */}
            <BookSummarySection book={book} />
          </div>
        </div>
      </div>

      {/* Share preview modal */}
      <BookSharePreview
        onCancel={togglePreviewVisible}
        onOk={togglePreviewVisible}
        background={book.image}
        opened={sharePreviewVisible}
        book={book}
        uid={uid}
      />
    </div>
  )
}

export default BookInfo
