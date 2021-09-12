import React from 'react'
import { APP_URL_ORIGIN, CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { fetchYearlyReport } from '../../schema/__generated__/fetchYearlyReport'
import { WenquBook } from '../../services/wenqu'
const logo = require('../../assets/logo.png').default

type OGWithReportProps = {
  data?: fetchYearlyReport
  year: number
}

function OGWithReport(props: OGWithReportProps) {
  const url = APP_URL_ORIGIN

  const metaTitle = `${props.data?.reportYearly.user.name} 在 ${props.year} 年共读了 ${props.data?.reportYearly.books.length} 本书- Clippingkk - kindle 书摘管理`

  const plainAvatar = props.data?.reportYearly.user.avatar
  const avatar = plainAvatar?.startsWith('http') ?
    plainAvatar :
    `${CDN_DEFAULT_DOMAIN}/${plainAvatar}`

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={avatar} />
      <meta property="og:description" content={metaTitle} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content='AnntarHe' />

      <meta name="twitter:card" content={metaTitle} />
      <meta name="twitter:site" content='clippingkk' />
      <meta name="twitter:creator" content={`@AnnatarHe`} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaTitle} />
      <meta name="twitter:image" content={avatar} />
    </React.Fragment>
  )
}

export default OGWithReport
