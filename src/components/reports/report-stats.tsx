import BookCover from '@/components/book/book-cover'
import { getTranslation } from '@/i18n'
import { toHtmlLang } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { WenquBook } from '@/services/wenqu'

import type { ReportBookData } from './report-data'

type ReportStatsProps = {
  books: number
  highlights: number
  top?: ReportBookData
  topBook?: WenquBook
}

const numberClass =
  'font-reading text-lake-fg text-4xl font-semibold tabular-nums'

async function ReportStats(props: ReportStatsProps) {
  const { books, highlights, top, topBook } = props
  const { t, i18n } = await getTranslation(undefined, 'report')
  const format = new Intl.NumberFormat(toHtmlLang(i18n.language))
  const topTitle = topBook?.title || top?.clippings[0]?.title || ''

  return (
    <section aria-labelledby="report-stats">
      <h2 id="report-stats" className="sr-only">
        {t('yearly.stats.label')}
      </h2>
      <ul
        className={cn(
          'rounded-lake-panel border-lake-line bg-lake-line grid gap-px overflow-hidden border sm:grid-cols-2',
          top && 'lg:grid-cols-[1fr_1fr_1.6fr]'
        )}
      >
        <li className="bg-lake-surface flex flex-col gap-1 p-6">
          <p className={numberClass}>{format.format(books)}</p>
          <p className="type-meta">
            {t('yearly.stats.books', { count: books })}
          </p>
        </li>
        <li className="bg-lake-surface flex flex-col gap-1 p-6">
          <p className={numberClass}>{format.format(highlights)}</p>
          <p className="type-meta">
            {t('yearly.stats.highlights', { count: highlights })}
          </p>
        </li>
        {top ? (
          <li className="bg-lake-surface flex items-center gap-4 p-6 sm:col-span-2 lg:col-span-1">
            <BookCover
              book={topBook}
              title={topTitle}
              className="w-12 shrink-0"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="type-eyebrow">{t('yearly.stats.top')}</p>
              <p className="font-reading text-lake-fg truncate font-semibold">
                {topTitle}
              </p>
              <p className="type-meta">
                {t('yearly.books.highlights', { count: top.clippingsCount })}
              </p>
            </div>
          </li>
        ) : null}
      </ul>
    </section>
  )
}

export default ReportStats
