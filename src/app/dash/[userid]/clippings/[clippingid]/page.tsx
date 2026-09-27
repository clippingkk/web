import Badge from '@annatarhe/lake-ui/badge'
import Button from '@annatarhe/lake-ui/button'
import Skeleton from '@annatarhe/lake-ui/skeleton'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import BookCover from '@/components/book/book-cover'
import AISummaryPanel from '@/components/clipping/ai-summary-panel'
import ClippingActions from '@/components/clipping/clipping-actions'
import { splitClippingLines } from '@/components/clipping/clipping-text'
import {
  getSiblingLinks,
  parseChannel,
} from '@/components/clipping/sibling-links'
import Page from '@/components/layout/page'
import ReactionBar from '@/components/reaction/reaction-bar'
import UserChip from '@/components/user/user-chip'
import { checkIsPremium } from '@/compute/user'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { getViewer } from '@/server/data/viewer'
import { isValidDoubanId } from '@/services/wenqu'
import { formatDate } from '@/utils/format-date'
import {
  bookHref,
  clippingHref,
  dashHref,
  getUserSlug,
} from '@/utils/profile.utils'
import { parseRouteId } from '@/utils/route-id'

import CommentsSection from './comments-section'
import { getClippingPage } from './data'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
  searchParams: Promise<{ iac?: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { clippingid } = await props.params
  const [{ clipping, book }, { t }] = await Promise.all([
    getClippingPage(parseRouteId(clippingid)),
    getTranslation(undefined, 'reading'),
  ])
  const name = clipping.creator.name
  return pageMetadata({
    title: book
      ? t('meta.title', { book: book.title, name })
      : t('meta.fallbackTitle', { name }),
    description: splitClippingLines(clipping.content).join(' ').slice(0, 180),
    path: clippingHref(clipping.creator, clipping.id),
    type: 'article',
  })
}

function CommentsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <Skeleton shape="text" className="h-6 w-40" />
      <Skeleton className="rounded-lake-control h-28 w-full" />
    </div>
  )
}

async function ClippingPage(props: PageProps) {
  const [{ clippingid }, { iac }] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const [{ clipping, book }, viewer, { t, i18n }] = await Promise.all([
    getClippingPage(parseRouteId(clippingid)),
    getViewer(),
    getTranslation(undefined, 'reading'),
  ])

  const creator = clipping.creator
  const isOwner = viewer?.id === creator.id
  const hasBook = isValidDoubanId(clipping.bookID)
  const bookTitle = book?.title ?? clipping.title
  const lines = splitClippingLines(clipping.content)
  const siblings = getSiblingLinks(
    parseChannel(iac),
    creator,
    clipping.prevClipping,
    clipping.nextClipping
  )
  const access = !viewer ? 'anonymous' : viewer.isPremium ? 'premium' : 'free'

  return (
    <Page width="wide">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <article className="flex max-w-3xl min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-1">
            <p className="type-eyebrow">{t('kicker')}</p>
            {hasBook ? (
              <Link
                href={bookHref(creator, clipping.bookID)}
                className="font-reading text-lake-fg hover:text-lake-accent-text focus-visible:ring-lake-ring w-fit rounded-sm text-xl font-semibold transition-colors duration-150 outline-none focus-visible:ring-2"
              >
                {bookTitle}
              </Link>
            ) : (
              <p className="font-reading text-lake-fg text-xl font-semibold">
                {bookTitle}
              </p>
            )}
            {book?.author ? (
              <p className="text-lake-fg-muted text-sm">{book.author}</p>
            ) : null}
          </div>

          <blockquote className="relative">
            <span
              aria-hidden="true"
              className="font-reading text-lake-accent/40 absolute -top-8 -left-1 text-7xl leading-none select-none md:-left-10"
            >
              “
            </span>
            <div className="type-quote-lg text-lake-fg flex flex-col gap-5">
              {lines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </blockquote>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <UserChip
              href={dashHref(creator, 'profile')}
              name={creator.name}
              avatar={creator.avatar}
              isPremium={checkIsPremium(creator.premiumEndAt)}
              detail={
                <time dateTime={clipping.createdAt}>
                  {formatDate(clipping.createdAt, i18n.language, 'long')}
                </time>
              }
            />
            {clipping.pageAt ? (
              <span className="type-meta">
                {t('page', { page: clipping.pageAt })}
              </span>
            ) : null}
            {isOwner && !clipping.visible ? (
              <Badge
                tone="neutral"
                variant="outline"
                size="sm"
                icon={<Lock className="size-3" aria-hidden="true" />}
              >
                {t('private')}
              </Badge>
            ) : null}
          </div>

          <div className="border-lake-line flex flex-wrap items-center justify-between gap-4 border-y py-4">
            <ReactionBar
              clippingId={clipping.id}
              viewerId={viewer?.id}
              symbolCounts={clipping.reactionData.symbolCounts}
            />
            <ClippingActions
              clipping={clipping}
              book={book}
              creatorSlug={getUserSlug(creator)}
              isOwner={isOwner}
            />
          </div>

          {siblings.prev || siblings.next ? (
            <nav
              aria-label={t('siblings.label')}
              className="flex items-center justify-between gap-3"
            >
              {siblings.prev ? (
                <Button
                  variant="ghost"
                  size="sm"
                  leadingIcon={<ArrowLeft className="size-4" />}
                  render={<Link href={siblings.prev} />}
                >
                  {t('siblings.prev')}
                </Button>
              ) : (
                <span />
              )}
              {siblings.next ? (
                <Button
                  variant="ghost"
                  size="sm"
                  trailingIcon={<ArrowRight className="size-4" />}
                  render={<Link href={siblings.next} />}
                >
                  {t('siblings.next')}
                </Button>
              ) : null}
            </nav>
          ) : null}
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          {hasBook ? (
            <Link
              href={bookHref(creator, clipping.bookID)}
              className="group rounded-lake-panel border-lake-line bg-lake-surface hover:border-lake-line-strong focus-visible:ring-lake-ring flex gap-4 border p-4 transition-colors duration-150 outline-none focus-visible:ring-2 lg:flex-col"
            >
              <BookCover
                book={book}
                title={bookTitle}
                className="w-20 shrink-0 lg:w-32"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-reading text-lake-fg group-hover:text-lake-accent-text font-semibold transition-colors duration-150">
                  {bookTitle}
                </span>
                {book?.author ? (
                  <span className="text-lake-fg-muted text-sm">
                    {book.author}
                  </span>
                ) : null}
                <span className="type-meta mt-1">
                  {t('book.highlightsBy', { name: creator.name })}
                </span>
              </span>
            </Link>
          ) : null}
          <AISummaryPanel
            clippingId={clipping.id}
            book={book}
            access={access}
          />
        </aside>
      </div>

      <div className="w-full max-w-3xl">
        <Suspense fallback={<CommentsSkeleton />}>
          <CommentsSection
            clippingId={clipping.id}
            bookTitle={bookTitle}
            viewer={viewer}
          />
        </Suspense>
      </div>
    </Page>
  )
}

export default ClippingPage
