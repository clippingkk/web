import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import logo from '../../assets/logo.png'

type OGWithAuthProps = {
  urlPath: string
}

function OGWithAuth(props: OGWithAuthProps) {
  const url = `${APP_URL_ORIGIN}/${props.urlPath}`

  const metaTitle = `登陆 - 书摘 - clippingkk`

  const logoLink = APP_URL_ORIGIN + logo.src

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
