import React from 'react'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'

type AvatarProps = {
  img: string
  name?: string
  className?: string
}

function Avatar(props: AvatarProps) {
  const avatar = props.img.startsWith('http') ? props.img : `${CDN_DEFAULT_DOMAIN}/${props.img}`

  let cls = props.className || ''

  if (!cls && !cls.includes('w-')) {
    cls += ' w-24 h-24'
  }

  if (props.img === '') {
    return null
  }
  return (
    <img
      src={avatar}
      alt={props.name}
      className={'rounded-full ' + cls}
    />
  )
}

export default Avatar
