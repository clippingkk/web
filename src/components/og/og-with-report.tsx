import React from 'react'
import { APP_URL_ORIGIN, CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { FetchYearlyReportQuery } from '../../schema/generated'
import { WenquBook } from '../../services/wenqu'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'
import { Metadata } from 'next'

type OGWithReportProps = {
  data?: FetchYearlyReportQuery
  books: WenquBook[]
  year: number
}

const url = APP_URL_ORIGIN
export function generateMetadata(year: number, data: FetchYearlyReportQuery, bs: WenquBook[]): Metadata {
  const metaTitle = `${data.reportYearly.user.name} 在 ${year} 年共读了 ${data?.reportYearly.books.length} 本书 - Clippingkk - kindle 书摘管理`
  const plainAvatar = data?.reportYearly.user.avatar
  const avatar = plainAvatar?.startsWith('http') ?
    plainAvatar :
    `${CDN_DEFAULT_DOMAIN}/${plainAvatar}`

  const desc = `${data?.reportYearly.user.name} 读了这些书 ${bs.map(x => x.title).join(', ')}`

  return {
    metadataBase: new URL(APP_URL_ORIGIN),
    title: metaTitle,
    openGraph: {
      url,
      type: 'website',
      title: metaTitle,
      images: [
        avatar
      ],
      description: desc,
      siteName: 'Clippingkk',
    },
    description: desc,
    keywords: `${bs.map(x => x.title).join(', ')}, ${data?.reportYearly.user.name}, clippingkk, 书摘`,
    twitter: {
      card: 'summary',
      site: '@AnnatarHe',
      creator: '@AnnatarHe',
      title: metaTitle,
      description: desc,
    }
  }
}
