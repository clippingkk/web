import React from 'react'
import ReportFavouritesPage from './content'
import { metadata as indexPageMetadata } from '../../../components/og/og-with-index'
import { Metadata } from 'next'

type FavouritesPageProps = {
}
export const metadata: Metadata = {
  ...indexPageMetadata,
  title: 'My favourites books',
}

function FavouritesPage(props: FavouritesPageProps) {
  return (
    <ReportFavouritesPage />
  )
}

export default FavouritesPage
