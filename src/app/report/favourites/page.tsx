import type { Metadata } from 'next'
import { metadata as indexPageMetadata } from '../../../components/og/og-with-index'
import ReportFavouritesPage from './content'

export const metadata: Metadata = {
  ...indexPageMetadata,
  title: 'My favourites books',
}

function FavouritesPage() {
  return <ReportFavouritesPage />
}

export default FavouritesPage
