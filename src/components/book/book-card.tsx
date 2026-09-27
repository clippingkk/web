'use client'

import type { Route } from 'next'
import Link from 'next/link'

import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import type { WenquBook } from '@/services/wenqu'
import { formatDate } from '@/utils/format-date'

import BookCover from './book-cover'

type BookCardProps = {
  href: Route
  doubanId: string
  book?: WenquBook | null
  /** Fallback title while Wenqu data is missing. */
  title?: string | null
  clippingsCount?: number | null
  lastReadingAt?: string | null
  variant?: 'shelf' | 'row'
  className?: string
}

function BookCard(props: BookCardProps) {
  const {
    href,
    doubanId,
    book,
    title,
    clippingsCount,
    lastReadingAt,
    variant = 'shelf',
    className,
  } = props
  const { t, i18n } = useTranslation(undefined, 'common')
  const displayTitle = book?.title || title || doubanId
  const meta = [
    typeof clippingsCount === 'number'
      ? t('book.highlights', { count: clippingsCount })
      : null,
    lastReadingAt ? formatDate(lastReadingAt, i18n.language, 'medium') : null,
  ].filter(Boolean)

  const focusRing =
    'outline-none focus-visible:ring-2 focus-visible:ring-lake-ring focus-visible:ring-offset-2 focus-visible:ring-offset-lake-canvas'

  if (variant === 'row') {
    return (
      <Link
        href={href}
        className={cn(
          'group rounded-lake-control hover:bg-lake-surface-muted/60 flex items-center gap-4 p-2 transition-colors duration-150',
          focusRing,
          className
        )}
      >
        <BookCover book={book} title={displayTitle} className="w-12 shrink-0" />
        <div className="min-w-0">
          <p className="font-reading text-lake-fg truncate font-semibold">
            {displayTitle}
          </p>
          {book?.author ? (
            <p className="text-lake-fg-muted truncate text-sm">{book.author}</p>
          ) : null}
          {meta.length ? (
            <p className="type-meta mt-0.5">{meta.join(' · ')}</p>
          ) : null}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'group rounded-lake-control flex flex-col gap-3',
        focusRing,
        className
      )}
    >
      <BookCover
        book={book}
        title={displayTitle}
        className="transition-transform duration-200 ease-(--ease-soft) group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
      />
      <div className="min-w-0">
        <p className="font-reading text-lake-fg line-clamp-2 leading-snug font-semibold">
          {displayTitle}
        </p>
        {book?.author ? (
          <p className="text-lake-fg-muted mt-0.5 truncate text-sm">
            {book.author}
          </p>
        ) : null}
        {meta.length ? (
          <p className="type-meta mt-1">{meta.join(' · ')}</p>
        ) : null}
      </div>
    </Link>
  )
}

export default BookCard
