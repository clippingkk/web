import type { Metadata } from 'next'
import { unstable_rethrow } from 'next/navigation'

import Page from '@/components/layout/page'
import Bookshelf from '@/components/marketing/bookshelf'
import ClosingCta from '@/components/marketing/closing-cta'
import FeaturedClippings from '@/components/marketing/featured-clippings'
import Features from '@/components/marketing/features'
import Hero from '@/components/marketing/hero'
import {
  pickFeaturedClippings,
  pickReaders,
  pickShelfBooks,
} from '@/components/marketing/landing-data'
import ReaderStrip from '@/components/marketing/reader-strip'
import MarketingShell from '@/components/shell/marketing-shell'
import { PublicDataDocument } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { authHref } from '@/lib/auth-href'
import { pageMetadata } from '@/lib/metadata'
import { serverQuery } from '@/server/data/query'
import { getViewer } from '@/server/data/viewer'
import { prefetchWenquBooks } from '@/server/data/wenqu'
import { dashHref } from '@/utils/profile.utils'

/** Fetched once; each section takes what it shows. */
const PUBLIC_LIMIT = 24
const FEATURED_COUNT = 3
const SHELF_COUNT = 6
const READER_COUNT = 12

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'marketing')
  return pageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/',
  })
}

/**
 * The front door keeps working when the public feed does not: the hero,
 * features and calls to action need no data.
 */
async function loadPublicData() {
  try {
    const data = await serverQuery(PublicDataDocument, { limit: PUBLIC_LIMIT })
    return data.public
  } catch (error) {
    unstable_rethrow(error)
    console.error('landing: public data unavailable', error)
    return null
  }
}

async function LandingPage() {
  const [viewer, publicData] = await Promise.all([
    getViewer(),
    loadPublicData(),
  ])
  const clippings = pickFeaturedClippings(
    publicData?.clippings ?? [],
    FEATURED_COUNT
  )
  const shelf = publicData ? pickShelfBooks(publicData, SHELF_COUNT) : []
  const readers = pickReaders(publicData?.users ?? [], READER_COUNT)
  const { byId } = await prefetchWenquBooks([
    ...clippings.map((c) => c.bookID),
    ...shelf.map((b) => b.doubanId),
  ])
  const bookTitles = new Map(
    [...byId].map(([id, book]) => [id, book.title] as const)
  )

  const signedIn = !!viewer
  // No `next`: after signing in from "Start your library" the reader belongs
  // in their library, not back on the landing page.
  const startHref = viewer ? dashHref(viewer.slug, 'home') : authHref()

  return (
    <MarketingShell>
      <Page width="wide" className="gap-20 md:gap-28 md:py-20">
        <Hero startHref={startHref} signedIn={signedIn} />
        <FeaturedClippings clippings={clippings} bookTitles={bookTitles} />
        <Bookshelf books={shelf} wenqu={byId} />
        <ReaderStrip readers={readers} />
        <Features />
        <ClosingCta startHref={startHref} signedIn={signedIn} />
      </Page>
    </MarketingShell>
  )
}

export default LandingPage
