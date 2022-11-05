import React from 'react'
import { APP_URL_ORIGIN, CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { profile_me } from '../../schema/__generated__/profile'
import logo from '../../assets/logo.png'
import MetaTwitterCard, { TwitterCardType } from './meta-twitter-card'

type OGWithUserProfileProps = {
  profile?: profile_me
}

function OGWithUserProfile(props: OGWithUserProfileProps) {
  const url = `${APP_URL_ORIGIN}/dash/${props.profile?.id}/profile`

  const metaTitle = `${props.profile?.name} - 书摘 - clippingkk`

  const logoLink = APP_URL_ORIGIN + logo.src

  const desc = `${props.profile?.name}; 整理了 ${props.profile?.clippingsCount} 条书摘; ${props.profile?.bio}`

  const plainAvatar = props.profile?.avatar ?? ''
  const avatar = (plainAvatar.length > 4) ? (
    plainAvatar.startsWith('http') ?
      plainAvatar :
      `${CDN_DEFAULT_DOMAIN}/${plainAvatar}`
  ) : logoLink


  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content={desc} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content={props.profile?.name} />

      <meta name='description' content={desc} />
      <meta name='keyword' content={`${props.profile?.name}, ${props.profile?.bio}, clippingkk, 书摘`} />
      <MetaTwitterCard
        card={TwitterCardType.summary}
        site='AnnatarHe'
        creator={props.profile?.name ?? ''}
        url={url}
        title={metaTitle}
        description={desc}
        image={avatar}
      />
    </React.Fragment>
  )
}

export default OGWithUserProfile
