import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
import logo from '../../assets/logo.png'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'

type OGWithClippingProps = {
  clipping?: fetchClipping_clipping
  book: WenquBook | null
}

function OGWithClipping(props: OGWithClippingProps) {
  const url = `${APP_URL_ORIGIN}/dash/${props.clipping?.creator.id}/clippings/${props.clipping?.id}?iac=0`

  const bookTitle = props.book?.title ?? props.clipping?.title
  const metaTitle = `${bookTitle} - ${props.clipping?.creator.name} 的书摘录 - clippingkk`

  const logoLink = props.book?.image ?? (APP_URL_ORIGIN + logo.src)

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content={props.clipping?.content} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content={props.clipping?.creator.name} />

      <meta name='description' content={props.clipping?.content} />
      <meta name='keyword' content={`${props.book?.title}, ${props.book?.author}, ${props.clipping?.title}, clippingkk, 书摘` } />
      <MetaTwitterCard
        card={TwitterCardType.summary}
        site='AnnatarHe'
        creator={props.clipping?.creator.name ?? ''}
        url={url}
        title={metaTitle}
        description={props.clipping?.content ?? ''}
        image={logoLink}
      />
    </React.Fragment>
  )
}

export default OGWithClipping
