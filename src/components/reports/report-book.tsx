import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import BookCover from '@/components/book/book-cover'
import ClippingCard from '@/components/clipping/clipping-card'
import { getTranslation } from '@/i18n'
import type { WenquBook } from '@/services/wenqu'
import { bookHref, clippingHref, type SlugUser } from '@/utils/profile.utils'

import { pickReportQuotes, type ReportBookData } from './report-data'

const QUOTES_PER_BOOK = 3

type ReportBookProps = {
  owner: SlugUser
  year: number
  book: ReportBookData
  wenqu?: WenquBook
}

/** One book of the year: its cover, how much was kept, and a few passages. */
async function ReportBook({ owner, year, book, wenqu }: ReportBookProps) {
  const { t } = await getTranslation(undefined, 'report')
  const quotes = pickReportQuotes(book.clippings, year, QUOTES_PER_BOOK)
  const title = wenqu?.title || book.clippings[0]?.title || book.doubanId
  const headingId = `book-${book.doubanId}`

  return (
    <article
      aria-labelledby={headingId}
      className="border-lake-line grid gap-6 border-t pt-10 sm:grid-cols-[8rem_minmax(0,1fr)] md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10"
    >
      <BookCover
        book={wenqu}
        title={title}
        author={wenqu?.author}
        className="w-28 sm:w-full"
      />
      <div className="flex min-w-0 flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h3 id={headingId} className="type-heading text-lake-fg">
            {title}
          </h3>
          {wenqu?.author ? (
            <p className="text-lake-fg-muted text-sm">{wenqu.author}</p>
          ) : null}
          <p className="type-meta mt-1">
            {t('yearly.books.highlights', { count: book.clippingsCount })}
          </p>
        </header>
        {quotes.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((clipping) => (
              <li key={clipping.id} className="flex">
                <ClippingCard
                  variant="compact"
                  hideSource
                  clipping={clipping}
                  href={clippingHref(owner, clipping.id)}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          href={bookHref(owner, book.doubanId)}
          className="text-lake-accent-text focus-visible:ring-lake-ring inline-flex w-fit items-center gap-1 rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-2"
        >
          {t('yearly.books.all')}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}

export default ReportBook
