'use client'
import { Share2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from '@/i18n/client'
import type { WenquBook } from '../../services/wenqu'
import BookSharePreview from '../preview/preview-book'
import BookCoverColumn from './book-cover-column'
import BookMetaSection from './book-meta-section'
import BookStatsBar from './book-stats-bar'
import BookSummarySection from './book-summary-section'
import BookTitleSection from './book-title-section'

type TBookInfoProp = {
  uid: number
  book: WenquBook
  duration?: number
  isLastReadingBook?: boolean
  clippingsCount?: number
  startReadingAt?: string
  lastReadingAt?: string
}

function BookInfo({
  book,
  uid,
  duration,
  clippingsCount,
  startReadingAt,
  lastReadingAt,
}: TBookInfoProp) {
  const { t } = useTranslation()
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible((v) => !v)
  }, [])

  return (
    <div className='relative w-full'>
      {/* Subtle background wash */}
      <div className='absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-blue-50/40 via-white/20 to-transparent dark:from-blue-950/30 dark:via-zinc-900/20 dark:to-transparent' />

      <div className='grid grid-cols-1 gap-6 py-6 md:grid-cols-[280px,1fr] lg:grid-cols-[320px,1fr] lg:gap-10 lg:py-8'>
        {/* Book cover column */}
        <BookCoverColumn
          book={book}
          togglePreviewVisible={togglePreviewVisible}
        />

        {/* Book details column */}
        <div className='font-lxgw space-y-6'>
          {/* Title and rating */}
          <BookTitleSection book={book} duration={duration} />

          {/* Reading stats bar */}
          <BookStatsBar
            clippingsCount={clippingsCount}
            duration={duration}
            startReadingAt={startReadingAt}
            lastReadingAt={lastReadingAt}
          />

          {/* Action buttons (desktop) */}
          <div className='hidden gap-4 md:flex'>
            <button
              onClick={() => togglePreviewVisible()}
              className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
            >
              <Share2 className='h-4 w-4' />
              <span>{t('app.book.share')}</span>
            </button>
          </div>

          {/* Book metadata */}
          <BookMetaSection book={book} />

          {/* Book summary */}
          <BookSummarySection book={book} />
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
