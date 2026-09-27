import EmptyState from '@annatarhe/lake-ui/empty-state'
import { CalendarX } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import BookCard from '@/components/book/book-card'
import { slimBook } from '@/components/book/slim-book'
import Page from '@/components/layout/page'
import Section from '@/components/layout/section'
import ReportBook from '@/components/reports/report-book'
import {
  rankReportBooks,
  reportYears,
  totalHighlights,
} from '@/components/reports/report-data'
import ReportStats from '@/components/reports/report-stats'
import YearSwitcher, {
  yearlyReportHref,
} from '@/components/reports/year-switcher'
import UserChip from '@/components/user/user-chip'
import { checkIsPremium } from '@/compute/user'
import { FetchYearlyReportDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { toHtmlLang } from '@/lib/theme'
import { serverQuery } from '@/server/data/query'
import { prefetchWenquBooks } from '@/server/data/wenqu'
import { resolveMediaUrl } from '@/utils/image'
import { bookHref, dashHref } from '@/utils/profile.utils'

/** Books that get a full section with quotes; the rest are a shelf. */
const FEATURED_BOOKS = 10
const MAX_INT = 2 ** 31 - 1

// User names and book titles go through React, which escapes them already.
const raw = { interpolation: { escapeValue: false } } as const

type SearchValue = string | string[] | undefined

type YearlyPageProps = {
  searchParams: Promise<{ uid?: SearchValue; year?: SearchValue }>
}

function first(value: SearchValue) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

/**
 * `uid` must be a user id; `year` defaults to the current year and is kept
 * between 2000 and now, so a hand-edited URL still lands on a real report.
 */
async function readParams(props: YearlyPageProps) {
  const params = await props.searchParams
  const uidParam = first(params.uid)
  const uid = /^\d+$/.test(uidParam) ? Number(uidParam) : Number.NaN
  if (!(uid > 0 && uid <= MAX_INT)) notFound()
  const now = new Date().getUTCFullYear()
  const yearParam = first(params.year)
  const year = /^\d{4}$/.test(yearParam)
    ? Math.min(Math.max(Number(yearParam), 2000), now)
    : now
  return { uid, year, now }
}

/** Shared by generateMetadata and the page within one request. */
const loadReport = cache(async (uid: number, year: number) => {
  const data = await serverQuery(FetchYearlyReportDocument, { uid, year })
  const report = data.reportYearly
  const books = rankReportBooks(report.books)
  const prefetched = await prefetchWenquBooks(books.map((b) => b.doubanId))
  return {
    user: report.user,
    books,
    highlights: totalHighlights(report.books),
    prefetched,
  }
})

export async function generateMetadata(
  props: YearlyPageProps
): Promise<Metadata> {
  const { uid, year } = await readParams(props)
  const [{ user, books, prefetched }, { t, i18n }] = await Promise.all([
    loadReport(uid, year),
    getTranslation(undefined, 'report'),
  ])
  const titles = books
    .slice(0, 5)
    .map((b) => prefetched.byId.get(b.doubanId)?.title)
    .filter((title): title is string => !!title)
  const list = new Intl.ListFormat(toHtmlLang(i18n.language), {
    style: 'short',
    type: 'conjunction',
  })
  return pageMetadata({
    title: t('yearly.meta.title', { name: user.name, year, ...raw }),
    description: titles.length
      ? t('yearly.meta.descriptionWithBooks', {
          name: user.name,
          year,
          titles: list.format(titles),
          ...raw,
        })
      : t('yearly.meta.description', { name: user.name, year, ...raw }),
    path: yearlyReportHref(uid, year),
    image: user.avatar ? resolveMediaUrl(user.avatar) : null,
    type: 'article',
  })
}

async function YearlyReportPage(props: YearlyPageProps) {
  const { uid, year, now } = await readParams(props)
  const [{ user, books, highlights, prefetched }, { t }] = await Promise.all([
    loadReport(uid, year),
    getTranslation(undefined, 'report'),
  ])
  const wenqu = prefetched.byId
  const featured = books.slice(0, FEATURED_BOOKS)
  const rest = books.slice(FEATURED_BOOKS)
  const top = books[0]

  return (
    <Page width="default" className="gap-12 md:gap-16">
      <header className="border-lake-line flex flex-col gap-6 border-b pb-8">
        <UserChip
          href={dashHref(user, 'profile')}
          name={user.name}
          avatar={user.avatar}
          isPremium={checkIsPremium(user.premiumEndAt)}
          detail={t('yearly.profile')}
        />
        <div className="flex flex-col gap-3">
          <p className="type-eyebrow">{t('yearly.eyebrow')}</p>
          <h1 className="type-display text-lake-fg max-w-3xl">
            {t('yearly.title', { name: user.name, year, ...raw })}
          </h1>
          <p className="text-lake-fg-muted max-w-2xl text-lg leading-relaxed">
            {t('yearly.summary', { name: user.name, ...raw })}
          </p>
        </div>
        <YearSwitcher
          uid={uid}
          current={year}
          years={reportYears(user.createdAt, year, now)}
          label={t('yearly.years.label')}
        />
      </header>

      {highlights === 0 ? (
        <EmptyState
          icon={<CalendarX className="size-6" />}
          title={t('yearly.empty.title', { year })}
          description={t('yearly.empty.description', {
            name: user.name,
            ...raw,
          })}
        />
      ) : (
        <>
          <ReportStats
            books={books.length}
            highlights={highlights}
            top={top}
            topBook={slimBook(top ? wenqu.get(top.doubanId) : undefined)}
          />

          {featured.length > 0 ? (
            <Section
              id="books"
              title={t('yearly.books.title')}
              description={t('yearly.books.description')}
              className="gap-10"
            >
              {featured.map((book) => (
                <ReportBook
                  key={book.doubanId}
                  owner={user}
                  year={year}
                  book={book}
                  wenqu={slimBook(wenqu.get(book.doubanId))}
                />
              ))}
            </Section>
          ) : null}

          {rest.length > 0 ? (
            <Section id="more-books" title={t('yearly.books.rest')}>
              <ul className="grid grid-cols-3 gap-x-5 gap-y-8 sm:grid-cols-4 md:grid-cols-6">
                {rest.map((book) => (
                  <li key={book.doubanId}>
                    <BookCard
                      href={bookHref(user, book.doubanId)}
                      doubanId={book.doubanId}
                      book={slimBook(wenqu.get(book.doubanId))}
                      title={book.clippings[0]?.title}
                      clippingsCount={book.clippingsCount}
                    />
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </>
      )}
    </Page>
  )
}

export default YearlyReportPage
