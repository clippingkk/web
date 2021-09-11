import React from 'react'
import { Helmet } from 'react-helmet'
import { APP_URL_ORIGIN } from '../../constants/config'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
const logo = require('../../assets/logo.png').default

type OGWithClippingProps = {
  clipping?: fetchClipping_clipping
  book: WenquBook | null
}

function OGWithClipping(props: OGWithClippingProps) {
  const url = `${APP_URL_ORIGIN}/dash/${props.clipping?.creator.id}/clippings/${props.clipping?.id}?iac=0`

  const bookTitle = props.book?.title ?? props.clipping?.title
  const metaTitle = `${bookTitle} - ${props.clipping?.creator.name} 的书摘录 - clippingkk`

  const logoLink = APP_URL_ORIGIN + logo

  return (
    <Helmet>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content={props.clipping?.content} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content={props.clipping?.creator.name} />

      <meta name="twitter:card" content={props.clipping?.content} />
      <meta name="twitter:site" content='clippingkk' />
      <meta name="twitter:creator" content={`@${props.clipping?.creator.name}`} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={props.clipping?.content} />
      <meta name="twitter:image" content={logoLink} />
    </Helmet>
  )
}

export default OGWithClipping
