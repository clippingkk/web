import type { Metadata } from 'next'

import BookHeader from '@/components/book/book-header'
import Page from '@/components/layout/page'
import { BookShelfDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { resolvePathUser } from '@/server/data/path-user'
import { serverQuery } from '@/server/data/query'
import { getViewer } from '@/server/data/viewer'
import { getWenquBookByDbId } from '@/services/wenqu'
import { bookHref, getUserSlug } from '@/utils/profile.utils'

import BookClippings from './book-clippings'

const PAGE_SIZE = 24

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
  const [data, book] = await Promise.all([
    // An unknown or non-numeric id has no visible clippings: not found.
    serverQuery(BookShelfDocument, {
      id: Number.isNaN(bookId) ? -1 : bookId,
      uid: pathUser.id,
      pagination: { limit: PAGE_SIZE, offset: 0 },
    }),
    getWenquBookByDbId(bookid),
  ])
  const isOwner = viewer?.id === pathUser.id
  const shelf = data.book
  const fallbackTitle = shelf.clippings[0]?.title ?? bookid

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
      />
      <BookClippings
        bookId={bookId}
        uid={pathUser.id}
        slug={getUserSlug(pathUser)}
        bookTitle={book?.title ?? fallbackTitle}
        totalCount={shelf.clippingsCount}
        initialClippings={shelf.clippings}
        pageSize={PAGE_SIZE}
        isOwner={isOwner}
      />
    </Page>
  )
}

export default BookPage
