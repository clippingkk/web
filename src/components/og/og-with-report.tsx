import type { Metadata } from 'next'

import { APP_URL_ORIGIN } from '../../constants/config'
import type { FetchYearlyReportQuery } from '../../schema/generated'
import type { WenquBook } from '../../services/wenqu'
import { resolveMediaUrl } from '../../utils/image'

const url = APP_URL_ORIGIN
export function generateMetadata(
  year: number,
  data: FetchYearlyReportQuery,
  bs: WenquBook[]
): Metadata {
  const metaTitle = `${data.reportYearly.user.name} 在 ${year} 年共读了 ${data?.reportYearly.books.length} 本书 - Clippingkk - kindle 书摘管理`
  const avatar = resolveMediaUrl(data?.reportYearly.user.avatar)

  const desc = `${data?.reportYearly.user.name} 读了这些书 ${bs.map((x) => x.title).join(', ')}`

  return {
    metadataBase: new URL(APP_URL_ORIGIN),
    title: metaTitle,
    openGraph: {
      url,
      type: 'website',
      title: metaTitle,
      images: [avatar],
      description: desc,
      siteName: 'Clippingkk',
    },
    description: desc,
    keywords: `${bs.map((x) => x.title).join(', ')}, ${data?.reportYearly.user.name}, clippingkk, 书摘`,
    twitter: {
      card: 'summary',
      site: '@AnnatarHe',
      creator: '@AnnatarHe',
      title: metaTitle,
      description: desc,
    },
  }
}
