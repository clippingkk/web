import type { Metadata } from 'next'
import { APP_URL_ORIGIN } from '../../constants/config'
import type { WenquBook } from '../../services/wenqu'

const url = APP_URL_ORIGIN
const metaTitle = '公共广场 - Clippingkk - kindle 书摘管理'

export function generateMetadata(books: WenquBook[]): Metadata {
  const desc = `这些书比较受欢迎: ${books.map((x) => x.title).join(', ')}`
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
