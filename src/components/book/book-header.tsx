import { buttonStyles } from '@annatarhe/lake-ui/button'
import { ExternalLink } from 'lucide-react'

import UserChip from '@/components/user/user-chip'
import { getTranslation } from '@/i18n'
import type { WenquBook } from '@/services/wenqu'
import { formatDate } from '@/utils/format-date'
import { dashHref } from '@/utils/profile.utils'

import BookCover from './book-cover'
import BookShareButton from './book-share-button'
import BookSummary from './book-summary'

type BookHeaderProps = {
  book: WenquBook | null
  /** The raw Kindle title, used when Wenqu has no record. */
  fallbackTitle: string
  owner: {
    id: number
    name: string
    avatar?: string | null
    domain?: string | null
  }
  isOwner: boolean
  clippingsCount: number
  startReadingAt?: string | null
  lastReadingAt?: string | null
}

async function BookHeader(props: BookHeaderProps) {
  const {
    book,
    fallbackTitle,
    owner,
    isOwner,
    clippingsCount,
    startReadingAt,
    lastReadingAt,
  } = props
  const [{ t, i18n }, { t: tc }] = await Promise.all([
    getTranslation(undefined, 'library'),
    getTranslation(undefined, 'common'),
  ])
  const lng = i18n.language
  const title = book?.title || fallbackTitle
  const byline = [book?.author, book?.press, book?.pubdate]
    .map((v) => v?.trim())
    .filter(Boolean)
  const from = formatDate(startReadingAt, lng)
  const to = formatDate(lastReadingAt, lng)

  return (
    <header className="border-lake-line grid gap-8 border-b pb-10 sm:grid-cols-[10rem_1fr] md:grid-cols-[13rem_1fr] md:gap-12">
      <BookCover
        book={book}
        title={title}
        author={book?.author}
        className="w-36 sm:w-full"
      />
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-3">
          {isOwner ? null : (
            <UserChip
              href={dashHref(owner, 'home')}
              name={owner.name}
              avatar={owner.avatar}
              detail={t('book.fromLibrary', { name: owner.name })}
            />
          )}
          <h1 className="type-display text-lake-fg">{title}</h1>
          {book?.originTitle && book.originTitle !== title ? (
            <p className="font-reading text-lake-fg-muted text-lg italic">
              {book.originTitle}
            </p>
          ) : null}
          {byline.length ? (
            <p className="text-lake-fg-muted">{byline.join(' · ')}</p>
          ) : null}
          <p className="type-meta flex flex-wrap gap-x-3 gap-y-1">
            <span>{tc('book.highlights', { count: clippingsCount })}</span>
            {from && to ? (
              <span>{t('book.readSpan', { from, to })}</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {book ? (
            <BookShareButton
              book={book}
              uid={owner.id}
              label={t('book.share')}
            />
          ) : null}
          {book?.url ? (
            <a
              href={book.url}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
            >
              {t('book.douban')}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
        {book?.summary ? (
          <BookSummary
            summary={book.summary}
            title={t('book.about')}
            showMoreLabel={t('book.showMore')}
            showLessLabel={t('book.showLess')}
          />
        ) : null}
      </div>
    </header>
  )
}

export default BookHeader
