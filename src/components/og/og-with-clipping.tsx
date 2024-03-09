import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import { WenquBook } from '../../services/wenqu'
import logo from '../../assets/logo.png'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'
import { Clipping, User } from '../../schema/generated'
import { Metadata } from 'next'

type OGWithClippingProps = {
  clipping?: Pick<Clipping, 'id' | 'title' | 'content'> & { creator: Pick<User, 'id' | 'name'> }
  book: WenquBook | null
}

export function generateMetadata(props: OGWithClippingProps): Metadata {
  const url = `${APP_URL_ORIGIN}/dash/${props.clipping?.creator.id}/clippings/${props.clipping?.id}?iac=0`

  const bookTitle = props.book?.title ?? props.clipping?.title
  const metaTitle = `${bookTitle} - ${props.clipping?.creator.name} 的书摘录 - clippingkk`

  const logoLink = props.book?.image ?? (APP_URL_ORIGIN + logo.src)

  return {
    metadataBase: new URL(APP_URL_ORIGIN),
    title: metaTitle,
    description: props.clipping?.content ?? '',
    openGraph: {
      url,
      type: 'website',
      title: metaTitle,
      description: props.clipping?.content ?? '',
      siteName: 'ClippingKK',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ClippingKK',
      creator: props.clipping?.creator.name ?? '',
      title: metaTitle,
      description: props.clipping?.content ?? '',
    }
  }
}
