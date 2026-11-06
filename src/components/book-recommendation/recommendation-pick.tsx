'use client'

import Skeleton from '@annatarhe/lake-ui/skeleton'
import { ArrowUpRight, Star } from 'lucide-react'
import Link from 'next/link'

import BookCover from '@/components/book/book-cover'
import { useBookSearch } from '@/hooks/book'
import { useTranslation } from '@/i18n/client'
import type {
  RecommendationPick as Pick,
  RecommendationsContext,
} from '@/lib/ai/schemas'
import { findRecommendedBook } from '@/lib/book-match'
import { isValidDoubanId } from '@/services/wenqu'
import { bookHref, type SlugSource } from '@/utils/profile.utils'

type RecommendationPickProps = {
  pick: Partial<Pick>
  /** False while the model is still writing, when the title may be cut off. */
  finished: boolean
  shelf: RecommendationsContext['shelf']
  owner: SlugSource
}

/** One recommended book. A real cover and rating appear only when the catalogue agrees. */
function RecommendationPick(props: RecommendationPickProps) {
  const { pick, finished, shelf, owner } = props
  const { t } = useTranslation(undefined, 'ai')
  const search = useBookSearch(pick.title ?? '', 0, finished)
  const book =
    finished && pick.title && pick.author
      ? findRecommendedBook(
          { title: pick.title, author: pick.author },
          search.data?.books ?? []
        )
      : undefined
  const source =
    pick.shelfRef === undefined
      ? undefined
      : shelf.find(({ ref }) => ref === pick.shelfRef)

  return (
    <li className="animate-in fade-in flex gap-4 py-5 duration-200 first:pt-0 last:pb-0 motion-reduce:animate-none">
      <div className="w-16 shrink-0 sm:w-20">
        {pick.title ? (
          <BookCover book={book} title={pick.title} author={pick.author} />
        ) : (
          <Skeleton shape="rect" className="aspect-[2/3] w-full" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {pick.kind ? (
          <p className="type-eyebrow">
            {t(`recommendations.kinds.${pick.kind}`)}
          </p>
        ) : null}
        <h3 className="type-heading text-lake-fg">{pick.title}</h3>
        <p className="type-meta flex flex-wrap items-center gap-x-2">
          <span>{pick.author}</span>
          {book?.rating ? (
            <span className="inline-flex items-center gap-0.5">
              <Star className="size-3" aria-hidden="true" />
              {book.rating.toFixed(1)}
            </span>
          ) : null}
        </p>
        {pick.hook ? (
          <p className="type-body text-lake-fg mt-1">{pick.hook}</p>
        ) : null}
        {pick.why ? (
          <p className="type-body text-lake-fg-muted">{pick.why}</p>
        ) : null}
        <div className="type-meta mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          {source ? (
            isValidDoubanId(source.bookId) ? (
              <Link
                href={bookHref(owner, source.bookId)}
                className="hover:text-lake-fg focus-visible:ring-lake-ring rounded-sm underline-offset-2 outline-none hover:underline focus-visible:ring-2"
              >
                {t('recommendations.because', { title: source.title })}
              </Link>
            ) : (
              <span>
                {t('recommendations.because', { title: source.title })}
              </span>
            )
          ) : null}
          {book?.url ? (
            <a
              href={book.url}
              target="_blank"
              rel="noreferrer"
              className="text-lake-accent-text focus-visible:ring-lake-ring inline-flex items-center gap-0.5 rounded-sm underline-offset-2 outline-none hover:underline focus-visible:ring-2"
            >
              {t('recommendations.viewBook')}
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </li>
  )
}

export default RecommendationPick
