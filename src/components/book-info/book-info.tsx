import { getTranslation } from '@/i18n'
import { getWenquBookByDbId } from '@/services/wenqu'

import BookCoverColumn from './book-cover-column'
import BookMetaSection from './book-meta-section'
import BookShareAction from './book-share-action'
import BookStatsBar from './book-stats-bar'
import BookSummarySection from './book-summary-section'
import BookTitleSection from './book-title-section'

type TBookInfoProp = {
  uid: number
  bookId: string
  duration?: number
  isLastReadingBook?: boolean
  clippingsCount?: number
  startReadingAt?: string
  lastReadingAt?: string
}

async function BookInfo({
  bookId,
  uid,
  duration,
  clippingsCount,
  startReadingAt,
  lastReadingAt,
}: TBookInfoProp) {
  const [book, { t }, { t: tBook }] = await Promise.all([
    getWenquBookByDbId(bookId),
    getTranslation(),
    getTranslation(undefined, 'book'),
  ])

  if (!book) {
    return null
  }

  const shareButtonClassName =
    'inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(14,165,233,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-600 hover:to-sky-600 hover:shadow-[0_24px_50px_-20px_rgba(14,165,233,0.95)]'

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(240,249,255,0.92),rgba(255,255,255,0.88))] p-6 shadow-[0_35px_90px_-48px_rgba(14,116,144,0.5)] ring-1 ring-slate-200/60 md:p-8 lg:p-10 dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(12,74,110,0.55),rgba(30,41,59,0.92))] dark:ring-slate-700/50">
      <div className="absolute -top-20 right-10 h-48 w-48 rounded-full bg-cyan-200/45 blur-3xl dark:bg-cyan-400/10" />
      <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-amber-100/55 blur-3xl dark:bg-amber-400/8" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-white/80 via-cyan-50/70 to-white/50 dark:from-white/5 dark:via-cyan-400/5 dark:to-white/0" />

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[minmax(260px,320px)_1fr] md:gap-10 lg:gap-12">
        <BookCoverColumn
          book={book}
          mobileShareAction={
            <BookShareAction
              book={book}
              uid={uid}
              label={t('app.book.share')}
              className={`${shareButtonClassName} w-full`}
              iconClassName="h-4 w-4"
            />
          }
        />

        <div className="font-lxgw space-y-8">
          <BookTitleSection book={book} />

          <BookStatsBar
            clippingsCount={clippingsCount}
            duration={duration}
            startReadingAt={startReadingAt}
            lastReadingAt={lastReadingAt}
            highlightsLabel={t('app.book.highlights')}
            readingDaysLabel={t('app.book.readingDays')}
            readingPeriodLabel={t('app.book.readingPeriod')}
          />

          <div className="hidden gap-4 md:flex">
            <BookShareAction
              book={book}
              uid={uid}
              label={t('app.book.share')}
              className={shareButtonClassName}
              iconClassName="h-4 w-4"
            />
          </div>

          <BookMetaSection
            book={book}
            publishedLabel={tBook('app.book.meta.published')}
            pagesLabel={tBook('app.book.meta.pages')}
          />

          <BookSummarySection
            book={book}
            title={tBook('app.book.summary.title')}
            showMoreLabel={tBook('app.book.summary.showMore')}
            showLessLabel={tBook('app.book.summary.showLess')}
          />
        </div>
      </div>
    </section>
  )
}

export default BookInfo
