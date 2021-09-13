import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import logo from '../../assets/logo.png'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'
import { WenquBook } from '../../services/wenqu'

type OGWithSquarePageProps = {
  books: WenquBook[]
}

function OGWithSquare(props: OGWithSquarePageProps) {
  const url = APP_URL_ORIGIN

  const metaTitle = `公共广场 - Clippingkk - kindle 书摘管理`

  const logoLink = APP_URL_ORIGIN + logo.src

  const desc = `这些书比较受欢迎: ${props.books.map(x => x.title).join(', ')}`

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
      <meta name='keyword' content={`clippingkk, 书摘, 首页` } />
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

export default OGWithSquare
