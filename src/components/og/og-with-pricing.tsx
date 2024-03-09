import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import logo from '../../assets/logo.png'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'
import { Metadata } from 'next'

type OGWithPricingProps = {
}
const url = APP_URL_ORIGIN
const metaTitle = `Clippingkk - kindle 书摘管理`
const desc = 'ClippingKK 帮助用户整理 kindle 中的笔记到可控制，可展示的界面中，并且使得这些笔记可以在用户手机中展示，时常可以温故知新，时常想想之前的话语'
const logoLink = APP_URL_ORIGIN + logo.src

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL_ORIGIN),
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
