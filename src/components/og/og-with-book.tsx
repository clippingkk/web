import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
const logo = require('../../assets/logo.png').default

type OGWithBookProps = {
  uid: number
  book: WenquBook | null
}

function OGWithBook(props: OGWithBookProps) {
  const url = `${APP_URL_ORIGIN}/dash/${props.uid}/book/${props.book?.doubanId}`

  const bookTitle = props.book?.title
  const metaTitle = `${bookTitle} - 书摘 - clippingkk`

  const logoLink = APP_URL_ORIGIN + logo

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content={props.book?.title} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content={props.book?.author} />

      <meta name="twitter:card" content={props.book?.title} />
      <meta name="twitter:site" content='clippingkk' />
      <meta name="twitter:creator" content={`@${props.book?.author}`} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={props.book?.title} />
      <meta name="twitter:image" content={logoLink} />
    </React.Fragment>
  )
}

export default OGWithBook
