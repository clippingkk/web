import React from 'react'
import ReportFavouritesPage from './content'
import { metadata as indexPageMetadata } from '../../../components/og/og-with-index'
import { Metadata } from 'next'

export const metadata: Metadata = {
  ...indexPageMetadata,
  title: 'My favourites books',
}

function FavouritesPage() {
  return (
    <ReportFavouritesPage />
  )
}

export default FavouritesPage
