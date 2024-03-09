import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import logo from '../../assets/logo.png'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'
import { WenquBook } from '../../services/wenqu'
import { Metadata } from 'next'

type OGWithSquarePageProps = {
  books: WenquBook[]
}

const url = APP_URL_ORIGIN
const metaTitle = `公共广场 - Clippingkk - kindle 书摘管理`
const logoLink = APP_URL_ORIGIN + logo.src


export function generateMetadata(books: WenquBook[]): Metadata {
  const desc = `这些书比较受欢迎: ${books.map(x => x.title).join(', ')}`
  return {
    metadataBase: new URL(APP_URL_ORIGIN),
    title: metaTitle,
    description: desc,
    openGraph: {
      url,
      type: 'website',
      title: metaTitle,
      description: desc,
      siteName: 'ClippingKK',
    },
    twitter: {
      card: 'summary',
      site: '@AnnatarHe',
      creator: '@AnnatarHe',
      title: metaTitle,
      description: desc,
    },
  }
}
