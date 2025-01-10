import { APP_URL_ORIGIN } from '../../constants/config'
import logo from '../../assets/logo.png'
import { Metadata } from 'next'

const metaTitle = 'Clippingkk - kindle 书摘管理'
const desc = 'ClippingKK 帮助用户整理 kindle 中的笔记到可控制，可展示的界面中，并且使得这些笔记可以在用户手机中展示，时常可以温故知新，时常想想之前的话语'

// const logoLink = APP_URL_ORIGIN + logo.src

export const metadata: Metadata = {
  title: metaTitle,
  description: desc,
  keywords: 'clippingkk, 书摘, 首页, kindle',
  authors: [{ name: 'AnnatarHe' }],
  openGraph: {
    url: APP_URL_ORIGIN,
    type: 'website',
    title: metaTitle,
    images: APP_URL_ORIGIN + logo.src,
    description: desc,
    siteName: 'clippingkk',
  },
  twitter: {
    card: 'summary',
    site: 'AnnatarHe',
    creator: 'AnnatarHe',
    title: metaTitle,
    description: desc,
    images: APP_URL_ORIGIN + logo.src,
  }
}
