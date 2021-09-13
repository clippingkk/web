import React from 'react'
import { APP_URL_ORIGIN } from '../../constants/config'
import { profile_me } from '../../schema/__generated__/profile'
import logo from '../../assets/logo.png'

type OGWithUserProfileProps = {
  profile?: profile_me
}

function OGWithUserProfile(props: OGWithUserProfileProps) {
  const url = `${APP_URL_ORIGIN}/dash/${props.profile?.id}/profile`

  const metaTitle = `${props.profile?.name} - 书摘 - clippingkk`

  const logoLink = APP_URL_ORIGIN + logo.src

  return (
    <React.Fragment>
      <meta property="og:url" content={url} />
      <meta property="og:type" content='website' />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:image" content={logoLink} />
      <meta property="og:description" content={props.profile?.name} />
      <meta property="og:site_name" content='clippingkk' />
      <meta property="article:author" content={props.profile?.name} />

      <meta name="twitter:card" content={metaTitle} />
      <meta name="twitter:site" content='clippingkk' />
      <meta name="twitter:creator" content={`@${props.profile?.name}`} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={props.profile?.name} />
      <meta name="twitter:image" content={logoLink} />
    </React.Fragment>
  )
}

export default OGWithUserProfile
