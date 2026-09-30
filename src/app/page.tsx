import type { Metadata } from 'next'
import { unstable_rethrow } from 'next/navigation'

import Page from '@/components/layout/page'
import Bookshelf from '@/components/marketing/bookshelf'
import ClosingCta from '@/components/marketing/closing-cta'
import FeaturedClippings from '@/components/marketing/featured-clippings'
import Features from '@/components/marketing/features'
import Hero from '@/components/marketing/hero'
import {
  type HeroClipping,
  pickFeaturedClippings,
  pickHeroClipping,
  pickReaders,
  pickShelfBooks,
  type PublicData,
} from '@/components/marketing/landing-data'
import ReaderStrip from '@/components/marketing/reader-strip'
import MarketingShell from '@/components/shell/marketing-shell'
import {
  FetchClippingsByUidDocument,
  type FetchClippingsByUidQuery,
  PublicDataDocument,
} from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { authHref } from '@/lib/auth-href'
import { pageMetadata } from '@/lib/metadata'
import { serverQuery } from '@/server/data/query'
import { getViewer, type Viewer } from '@/server/data/viewer'
import { prefetchWenquBooks } from '@/server/data/wenqu'
import { IN_APP_CHANNEL } from '@/services/channel'
import { clippingHref, dashHref } from '@/utils/profile.utils'

/** Fetched once; each section takes what it shows. */
const PUBLIC_LIMIT = 24
const FEATURED_COUNT = 3
const SHELF_COUNT = 6
const READER_COUNT = 12
/** The reader's latest public highlights, to find one for the hero. */
const OWN_LIMIT = 12

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

type OwnClipping = FetchClippingsByUidQuery['clippingList']['items'][number]

/** The signed-in reader's own public highlights; like the feed, optional. */
async function loadOwnClippings(uid: number): Promise<OwnClipping[]> {
  try {
    const data = await serverQuery(
      FetchClippingsByUidDocument,
      { uid, pagination: { limit: OWN_LIMIT } },
      { notFound: 'null', unauthorized: 'null' }
    )
    return data?.clippingList.items ?? []
  } catch (error) {
    unstable_rethrow(error)
    console.error('landing: own clippings unavailable', error)
    return []
  }
}

/**
 * The hero quote: one of the reader's own highlights when signed in, else a
 * public one, else none (the hero then shows its sample passage).
 */
function pickHero(
  viewer: Viewer | null,
  ownClippings: readonly OwnClipping[],
  publicData: PublicData | null
): HeroClipping | null {
  const own = viewer ? pickHeroClipping(ownClippings) : null
  if (viewer && own) {
    const { id, name, avatar, domain } = viewer
    return { ...own, creator: { id, name, avatar, domain }, own: true }
  }
  const pick = pickHeroClipping(publicData?.clippings ?? [])
  return pick ? { ...pick, own: false } : null
}

async function LandingPage() {
  const viewerPromise = getViewer()
  const [viewer, publicData, ownClippings] = await Promise.all([
    viewerPromise,
    loadPublicData(),
    // Starts as soon as the viewer is known, alongside the public feed.
    viewerPromise.then((v) => (v ? loadOwnClippings(v.id) : [])),
  ])
  const hero = pickHero(viewer, ownClippings, publicData)
  // The hero's quote is not repeated among the featured ones.
  const clippings = pickFeaturedClippings(
    (publicData?.clippings ?? []).filter((c) => c.id !== hero?.id),
    FEATURED_COUNT
  )
  const shelf = publicData ? pickShelfBooks(publicData, SHELF_COUNT) : []
  const readers = pickReaders(publicData?.users ?? [], READER_COUNT)
  const { byId } = await prefetchWenquBooks([
    ...(hero ? [hero.bookID] : []),
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
        <Hero
          startHref={startHref}
          signedIn={signedIn}
          quote={
            hero
              ? {
                  clipping: hero,
                  bookTitle: bookTitles.get(hero.bookID) || hero.title,
                  href: clippingHref(
                    hero.creator,
                    hero.id,
                    IN_APP_CHANNEL.clippingFromUser
                  ),
                }
              : null
          }
        />
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
