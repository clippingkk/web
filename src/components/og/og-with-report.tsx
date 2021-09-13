import React from 'react'
import { APP_URL_ORIGIN, CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { fetchYearlyReport } from '../../schema/__generated__/fetchYearlyReport'
import { WenquBook } from '../../services/wenqu'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'

type OGWithReportProps = {
  data?: fetchYearlyReport
  books: WenquBook[]
  year: number
}

function OGWithReport(props: OGWithReportProps) {
  const url = APP_URL_ORIGIN
  const metaTitle = `${props.data?.reportYearly.user.name} 在 ${props.year} 年共读了 ${props.data?.reportYearly.books.length} 本书 - Clippingkk - kindle 书摘管理`

  const plainAvatar = props.data?.reportYearly.user.avatar
  const avatar = plainAvatar?.startsWith('http') ?
    plainAvatar :
    `${CDN_DEFAULT_DOMAIN}/${plainAvatar}`

  const desc = `${props.data?.reportYearly.user.name} 读了这些书 ${props.books.map(x => x.title).join(', ')}`

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={avatar} />
      <meta property="og:description" content={desc} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content='AnntarHe' />

      <meta name='description' content={desc} />
      <meta name='keyword' content={`${props.books.map(x => x.title).join(', ')}, ${props.data?.reportYearly.user.name}, clippingkk, 书摘` } />
      <MetaTwitterCard
        card={TwitterCardType.summary}
        site='AnnatarHe'
        creator={props.data?.reportYearly.user.name ?? ''}
        url={url}
        title={metaTitle}
        description={desc}
        image={avatar}
      />
    </React.Fragment>
  )
}

export default OGWithReport
