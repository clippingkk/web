import type { Metadata } from 'next'

import BookHeader from '@/components/book/book-header'
import Page from '@/components/layout/page'
import { BookCommentsDocument, BookShelfDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { cachedBookSummary } from '@/server/ai/book-summary'
import { resolvePathUser } from '@/server/data/path-user'
import { serverQuery } from '@/server/data/query'
import { getViewer } from '@/server/data/viewer'
import { getWenquBookByDbId } from '@/services/wenqu'
import { bookHref, getUserSlug } from '@/utils/profile.utils'

import BookAiSummary from './book-ai-summary'
import BookClippings from './book-clippings'
import BookCommentsLink from './book-comments-link'
import BookTabs from './book-tabs'

const PAGE_SIZE = 24
const COMMENTS_PAGE_SIZE = 20

type PageProps = {
  params: Promise<{ bookid: string; userid: string }>
}

function parseBookId(bookid: string) {
  return /^\d+$/.test(bookid) ? Number(bookid) : Number.NaN
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { bookid, userid } = await props.params
  const [user, book, { t }] = await Promise.all([
    resolvePathUser(userid),
    getWenquBookByDbId(bookid),
    getTranslation(undefined, 'library'),
  ])
  const title = book?.title ?? ''
  return pageMetadata({
    title: title
      ? t('book.meta.title', { title, name: user.name })
      : t('home.meta.title', { name: user.name }),
    description: book?.summary?.slice(0, 180) || undefined,
    path: bookHref(user, bookid),
    image: book?.image,
    type: 'book',
  })
}

async function BookPage(props: PageProps) {
  const { bookid, userid } = await props.params
  const bookId = parseBookId(bookid)
  const [pathUser, viewer] = await Promise.all([
    resolvePathUser(userid),
    getViewer(),
  ])
  const [data, book, comments, { t }] = await Promise.all([
    // An unknown or non-numeric id has no visible clippings: not found.
    serverQuery(BookShelfDocument, {
      id: Number.isNaN(bookId) ? -1 : bookId,
      uid: pathUser.id,
      pagination: { limit: PAGE_SIZE, offset: 0 },
    }),
    getWenquBookByDbId(bookid),
    // One discussion per book, whoever's shelf this is.
    serverQuery(BookCommentsDocument, {
      doubanId: bookid,
      pagination: { limit: COMMENTS_PAGE_SIZE },
    }),
    getTranslation(undefined, 'library'),
  ])
  const isOwner = viewer?.id === pathUser.id
  const shelf = data.book
  const fallbackTitle = shelf.clippings[0]?.title ?? bookid
  const bookTitle = book?.title ?? fallbackTitle
  const commentsCount = comments.bookComments.count
  const initialSummary =
    isOwner && viewer?.isPremium && Number.isInteger(bookId)
      ? await cachedBookSummary(viewer.id, String(bookId))
      : null

  return (
    <Page width="wide">
      <BookHeader
        book={book}
        fallbackTitle={fallbackTitle}
        owner={pathUser}
        isOwner={isOwner}
        clippingsCount={shelf.clippingsCount}
        startReadingAt={shelf.startReadingAt}
        lastReadingAt={shelf.lastReadingAt}
        extraMeta={
          commentsCount > 0 ? (
            <BookCommentsLink>
              {t('book.commentsCount', { count: commentsCount })}
            </BookCommentsLink>
          ) : null
        }
      />
      {isOwner && viewer && Number.isInteger(bookId) ? (
        <BookAiSummary
          bookId={String(bookId)}
          title={bookTitle}
          owner={pathUser}
          access={viewer.isPremium ? 'premium' : 'free'}
          initial={initialSummary}
        />
      ) : null}
      <BookTabs
        doubanId={bookid}
        bookTitle={bookTitle}
        highlightsCount={shelf.clippingsCount}
        highlights={
          <BookClippings
            bookId={bookId}
            uid={pathUser.id}
            slug={getUserSlug(pathUser)}
            bookTitle={bookTitle}
            totalCount={shelf.clippingsCount}
            initialClippings={shelf.clippings}
            pageSize={PAGE_SIZE}
            isOwner={isOwner}
          />
        }
        initialComments={comments.bookComments.items}
        commentsCount={commentsCount}
        commentsPageSize={COMMENTS_PAGE_SIZE}
        viewer={
          viewer
            ? {
                id: viewer.id,
                name: viewer.name,
                avatar: viewer.avatar,
                isPremium: viewer.isPremium,
                isAdmin: viewer.isAdmin,
              }
            : null
        }
      />
    </Page>
  )
}

export default BookPage
