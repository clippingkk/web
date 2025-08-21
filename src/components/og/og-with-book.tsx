import type { Metadata } from 'next'
import React from 'react'
import logo from '../../assets/logo.png'
import { APP_URL_ORIGIN } from '../../constants/config'
import type { WenquBook } from '../../services/wenqu'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'

type OGWithBookProps = {
  domain: string
  book: WenquBook | null
}
export function generateMetadata(
  uid: string,
  book?: WenquBook | null
): Metadata {
  const url = `${APP_URL_ORIGIN}/dash/${uid}/book/${book?.doubanId}`
  const bookTitle = book?.title
  const metaTitle = `${bookTitle} - 书摘 - clippingkk`

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _logoLink = book?.image ?? APP_URL_ORIGIN + logo.src
  return {
    metadataBase: new URL(APP_URL_ORIGIN),
    title: metaTitle,
    description: book?.title,
    openGraph: {
      type: 'website',
      url,
      title: metaTitle,
      description: book?.title,
      siteName: 'ClippingKK',
    },
    twitter: {
      card: 'summary',
      site: '@AnnatarHe',
      creator: '@AnnatarHe',
      title: metaTitle,
      description: book?.title,
    },
  }
}

function OGWithBook(props: OGWithBookProps) {
  const url = `${APP_URL_ORIGIN}/dash/${props.domain}/book/${props.book?.doubanId}`
  const bookTitle = props.book?.title
  const metaTitle = `${bookTitle} - 书摘 - clippingkk`

  const logoLink = props.book?.image ?? APP_URL_ORIGIN + logo.src

  return (
    <React.Fragment>
      <meta property='og:url' content={url} />
      <meta property='og:type' content='website' />
      <meta property='og:title' content={metaTitle} />
      <meta property='og:image' content={logoLink} />
      <meta property='og:description' content={props.book?.title} />
      <meta property='og:site_name' content='clippingkk' />
      <meta property='article:author' content={props.book?.author} />

      <meta name='description' content={props.book?.title} />
      <meta
        name='keyword'
        content={`${props.book?.title}, ${props.book?.author}, clippingkk, 书摘`}
      />
      <MetaTwitterCard
        card={TwitterCardType.summary}
        site='AnnatarHe'
        creator={props.book?.author ?? ''}
        url={url}
        title={metaTitle}
        description={props.book?.title ?? ''}
        image={logoLink}
      />
    </React.Fragment>
  )
}

export default OGWithBook
