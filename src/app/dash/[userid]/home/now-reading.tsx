import Button from '@annatarhe/lake-ui/button'
import Link from 'next/link'

import BookCover from '@/components/book/book-cover'
import ClippingCard from '@/components/clipping/clipping-card'
import Section from '@/components/layout/section'
import type { LibraryOverviewQuery } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import type { WenquBook } from '@/services/wenqu'
import { bookHref, clippingHref } from '@/utils/profile.utils'

type RecentClipping = LibraryOverviewQuery['me']['recents'][number]

type NowReadingProps = {
  slug: string
  clipping: RecentClipping
  book?: WenquBook | null
  isOwner: boolean
}

async function NowReading({ slug, clipping, book, isOwner }: NowReadingProps) {
  const { t } = await getTranslation(undefined, 'library')
  const href = bookHref(slug, clipping.bookID)
  const title = book?.title || clipping.title

  return (
    <Section id="now-reading" title={t('home.nowReading.title')}>
      <div className="rounded-lake-panel border-lake-line bg-lake-surface shadow-lake-card grid items-start gap-6 border p-5 sm:grid-cols-[8rem_1fr] md:grid-cols-[11rem_1fr] md:gap-10 md:p-8">
        <Link
          href={href}
          className="rounded-lake-control focus-visible:ring-lake-ring w-28 outline-none focus-visible:ring-2 sm:w-full"
          aria-label={title}
        >
          <BookCover book={book} title={title} />
        </Link>
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Link
              href={href}
              className="type-heading text-lake-fg hover:text-lake-accent-text focus-visible:ring-lake-ring w-fit rounded-sm transition-colors duration-150 outline-none focus-visible:ring-2"
            >
              {title}
            </Link>
            {book?.author ? (
              <p className="text-lake-fg-muted text-sm">{book.author}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-eyebrow">{t('home.nowReading.latest')}</p>
            <ClippingCard
              variant="feature"
              hideSource
              showPrivate={isOwner}
              clipping={clipping}
              href={clippingHref(slug, clipping.id)}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="w-fit"
            render={<Link href={href} />}
          >
            {t('home.nowReading.openBook')}
          </Button>
        </div>
      </div>
    </Section>
  )
}

export default NowReading
