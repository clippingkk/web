import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
const logo = require('../../assets/logo.png').default

type OGWithAuthProps = {
  urlPath: string
}

function OGWithAuth(props: OGWithAuthProps) {
  const url = `${APP_URL_ORIGIN}/${props.urlPath}`

  const bookTitle = '登陆'
  const metaTitle = `登陆 - 书摘 - clippingkk`

  const logoLink = APP_URL_ORIGIN + logo

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content='书摘 kindle' />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content='AnnatarHe' />

      <meta name="twitter:card" content={metaTitle} />
      <meta name="twitter:site" content='clippingkk' />
      <meta name="twitter:creator" content={`@AnnatarHe`} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content='书摘 kindle' />
      <meta name="twitter:image" content={logoLink} />
    </React.Fragment>
  )
}

export default OGWithAuth
