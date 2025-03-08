'use client'
import React, { useCallback, useState } from 'react'
import { WenquBook } from '../../services/wenqu'
import BlurhashView from '@annatarhe/blurhash-react'
import { useTranslation } from 'react-i18next'
import BookSharePreview from '../preview/preview-book'
import { Calendar, Clock, Share2, Star, BookOpen } from 'lucide-react'
import BookCoverColumn from './book-cover-column'
import BookTitleSection from './book-title-section'
import BookMetaSection from './book-meta-section'
import BookSummarySection from './book-summary-section'

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
    setSharePreviewVisible(v => !v)
  }, [])
  return (
    <div className="relative mt-16 md:mt-24 w-full ">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/30 via-white/20 to-white/5 dark:from-gray-800/30 dark:via-gray-800/20 dark:to-gray-900/5 backdrop-blur-lg"></div>

      {/* Main content container */}
      <div className="w-full max-w-7xl mx-auto rounded-2xl  backdrop-blur-lg bg-gradient-to-br from-white/70 via-white/60 to-white/40 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40 shadow-xl border border-gray-200 dark:border-gray-700">

        {/* Book content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-8">

          {/* Book cover column */}
          <BookCoverColumn book={book} togglePreviewVisible={togglePreviewVisible} />

          {/* Book details column */}
          <div className="md:col-span-2 lg:col-span-3 font-lxgw">
            {/* Title and rating */}
            <BookTitleSection book={book} duration={duration} />

            {/* Action buttons (desktop) */}
            <div className="hidden md:flex mt-6 gap-4">
              <button
                onClick={() => togglePreviewVisible()}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
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
