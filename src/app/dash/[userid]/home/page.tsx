import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { HydrationBoundary } from '@tanstack/react-query'
import { BookMarked, BookOpenText, Upload } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import AIBookRecommendationButton from '@/components/book-recommendation/ai-book-recommendation-button'
import Callout from '@/components/layout/callout'
import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import Section from '@/components/layout/section'
import UserChip from '@/components/user/user-chip'
import { LibraryOverviewDocument, UncheckedCountDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { resolvePathUser } from '@/server/data/path-user'
import { serverQuery } from '@/server/data/query'
import { getViewer } from '@/server/data/viewer'
import { prefetchWenquBooks } from '@/server/data/wenqu'
import { isValidDoubanId } from '@/services/wenqu'
import { resolveMediaUrl } from '@/utils/image'
import { dashHref, getUserSlug, isUsableDomain } from '@/utils/profile.utils'

import LibraryShelf from './library-shelf'
import NowReading from './now-reading'
import ProfileCallout from './profile-callout'

const SHELF_PAGE_SIZE = 18

type PageProps = {
  params: Promise<{ userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { userid } = await props.params
  const [user, { t }] = await Promise.all([
    resolvePathUser(userid),
    getTranslation(undefined, 'library'),
  ])
  return pageMetadata({
    title: t('home.meta.title', { name: user.name }),
    description: user.bio || t('home.meta.description', { name: user.name }),
    path: dashHref(user, 'home'),
    image: user.avatar ? resolveMediaUrl(user.avatar) : null,
    type: 'profile',
  })
}

async function LibraryPage(props: PageProps) {
  const { userid } = await props.params
  const [pathUser, viewer, { t }] = await Promise.all([
    resolvePathUser(userid),
    getViewer(),
    getTranslation(undefined, 'library'),
  ])
  const isOwner = viewer?.id === pathUser.id
  const slug = getUserSlug(pathUser)

  const [overview, unchecked] = await Promise.all([
    serverQuery(LibraryOverviewDocument, {
      uid: pathUser.id,
      pagination: { limit: SHELF_PAGE_SIZE, offset: 0 },
    }),
    isOwner
      ? serverQuery(
          UncheckedCountDocument,
          { uid: pathUser.id },
          { notFound: 'null' }
        )
      : Promise.resolve(null),
  ])

  const books = overview.books
  const latest = overview.me.recents.find((c) => isValidDoubanId(c.bookID))
  const prefetched = await prefetchWenquBooks([
    ...(latest ? [latest.bookID] : []),
    ...books.map((b) => b.doubanId),
  ])

  const uncheckedCount = unchecked?.book.clippingsCount ?? 0
  const needsProfile =
    isOwner &&
    (pathUser.name.startsWith('user.') ||
      !pathUser.avatar ||
      !pathUser.bio ||
      !isUsableDomain(pathUser.domain))

  const summary = t('home.summary', {
    books: pathUser.booksCount,
    clippings: pathUser.clippingsCount,
  })

  return (
    <Page width="wide">
      <PageHeader
        eyebrow={
          isOwner ? (
            t('home.ownerEyebrow')
          ) : (
            <UserChip
              href={dashHref(pathUser, 'profile')}
              name={pathUser.name}
              avatar={pathUser.avatar}
              className="normal-case"
            />
          )
        }
        title={
          isOwner
            ? t('home.ownerTitle', { name: pathUser.name })
            : t('home.visitorTitle', { name: pathUser.name })
        }
        meta={<span>{summary}</span>}
        actions={
          isOwner ? (
            <>
              {books.length > 0 ? (
                <AIBookRecommendationButton uid={pathUser.id} books={books} />
              ) : null}
              <Button
                variant="primary"
                size="sm"
                leadingIcon={<Upload className="size-4" />}
                render={<Link href={dashHref(pathUser, 'upload')} />}
              >
                {t('home.import')}
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              render={<Link href={dashHref(pathUser, 'profile')} />}
            >
              {t('home.viewProfile')}
            </Button>
          )
        }
      />

      {uncheckedCount > 0 || needsProfile ? (
        <div className="flex flex-col gap-3">
          {uncheckedCount > 0 ? (
            <Callout
              tone="warning"
              icon={<BookMarked />}
              title={t('home.unchecked.title', { count: uncheckedCount })}
              description={t('home.unchecked.description')}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  render={<Link href={dashHref(pathUser, 'unchecked')} />}
                >
                  {t('home.unchecked.action')}
                </Button>
              }
            />
          ) : null}
          {needsProfile ? (
            <ProfileCallout
              editHref={`${dashHref(pathUser, 'profile')}?with_profile_editor=1`}
            />
          ) : null}
        </div>
      ) : null}

      <HydrationBoundary state={prefetched.state}>
        {latest ? (
          <NowReading
            slug={slug}
            clipping={latest}
            book={prefetched.byId.get(latest.bookID)}
            isOwner={isOwner}
          />
        ) : null}

        <Section
          id="shelf"
          title={t('home.shelf.title')}
          description={
            isOwner
              ? t('home.shelf.ownerDescription')
              : t('home.shelf.visitorDescription')
          }
        >
          {books.length > 0 ? (
            <LibraryShelf
              uid={pathUser.id}
              slug={slug}
              initialBooks={books}
              pageSize={SHELF_PAGE_SIZE}
            />
          ) : (
            <EmptyState
              icon={<BookOpenText className="size-6" />}
              title={
                isOwner
                  ? t('home.empty.ownerTitle')
                  : t('home.empty.visitorTitle')
              }
              description={
                isOwner
                  ? t('home.empty.ownerDescription')
                  : t('home.empty.visitorDescription', {
                      name: pathUser.name,
                    })
              }
              action={
                isOwner ? (
                  <Button
                    variant="primary"
                    render={<Link href={dashHref(pathUser, 'upload')} />}
                  >
                    {t('home.import')}
                  </Button>
                ) : null
              }
            />
          )}
        </Section>
      </HydrationBoundary>
    </Page>
  )
}

export default LibraryPage
