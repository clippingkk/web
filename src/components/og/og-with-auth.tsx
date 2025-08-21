import type { Metadata } from 'next'
import React from 'react'
import logo from '../../assets/logo.png'
import { APP_URL_ORIGIN } from '../../constants/config'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'

type OGWithAuthProps = {
  urlPath: string
}

const metaTitle = '登陆 - 书摘 - clippingkk'

const logoLink = APP_URL_ORIGIN + logo.src
const desc = '书摘 kindle'

export function generateMetadata(urlPath: string): Metadata {
  const url = `${APP_URL_ORIGIN}/${urlPath}`
  return {
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

function OGWithAuth(props: OGWithAuthProps) {
  const url = `${APP_URL_ORIGIN}/${props.urlPath}`

  return (
    <React.Fragment>
      <meta property='og:url' content={url} />
      <meta property='og:type' content='website' />
      <meta property='og:title' content={metaTitle} />
      <meta property='og:image' content={logoLink} />
      <meta property='og:description' content={desc} />
      <meta property='og:site_name' content='clippingkk' />
      <meta property='article:author' content='AnnatarHe' />

      <meta name='description' content={desc} />
      <meta name='keyword' content='clippingkk, 书摘, 登陆' />

      <MetaTwitterCard
        card={TwitterCardType.summary}
        site='AnnatarHe'
        creator='AnnatarHe'
        url={url}
        title={metaTitle}
        description={desc}
        image={logoLink}
      />
    </React.Fragment>
  )
}

export default OGWithAuth
