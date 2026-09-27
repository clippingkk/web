import type { Metadata } from 'next'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'

import FavouritesBuilder from './favourites-builder'
import { MAX_BOOKS, MIN_BOOKS } from './limits'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'report')
  return pageMetadata({
    title: t('favourites.meta.title'),
    description: t('favourites.meta.description'),
    path: '/report/favourites',
  })
}

async function FavouritesPage() {
  const { t } = await getTranslation(undefined, 'report')
  return (
    <Page width="wide">
      <PageHeader
        eyebrow={t('favourites.eyebrow')}
        title={t('favourites.title')}
        description={t('favourites.description', {
          min: MIN_BOOKS,
          max: MAX_BOOKS,
        })}
      />
      <FavouritesBuilder />
    </Page>
  )
}

export default FavouritesPage
