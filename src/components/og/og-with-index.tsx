import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import logo from '../../assets/logo.png'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'

type OGWithIndexProps = {
}

function OGWithIndex(props: OGWithIndexProps) {
  const url = APP_URL_ORIGIN

  const metaTitle = `Clippingkk - kindle 书摘管理`
  const desc = 'ClippingKK 帮助用户整理 kindle 中的笔记到可控制，可展示的界面中，并且使得这些笔记可以在用户手机中展示，时常可以温故知新，时常想想之前的话语'

  const logoLink = APP_URL_ORIGIN + logo.src

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content={desc} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content='AnntarHe' />

      <meta name='description' content={desc} />
      <meta name='keyword' content={`clippingkk, 书摘, 首页, kindle` } />
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

export default OGWithIndex
