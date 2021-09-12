import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
const logo = require('../../assets/logo.png').default

type OGWithIndexProps = {
}

function OGWithIndex(props: OGWithIndexProps) {
  const url = APP_URL_ORIGIN

  const metaTitle = `Clippingkk - kindle 书摘管理`

  const logoLink = APP_URL_ORIGIN + logo

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content={metaTitle} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content='AnntarHe' />

      <meta name="twitter:card" content={metaTitle} />
      <meta name="twitter:site" content='clippingkk' />
      <meta name="twitter:creator" content={`@AnnatarHe`} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaTitle} />
      <meta name="twitter:image" content={logoLink} />
    </React.Fragment>
  )
}

export default OGWithIndex
