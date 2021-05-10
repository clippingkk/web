import React from 'react'

type AvatarProps = {
  img: string
  name?: string
  className?: string
}

function Avatar(props: AvatarProps) {
  const avatar = props.img.startsWith('http') ? props.img : `https://clippingkk-cdn.annatarhe.com/${props.img}-copyrightDB`

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
