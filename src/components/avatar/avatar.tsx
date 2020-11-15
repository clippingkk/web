import React from 'react'

type AvatarProps = {
  img: string
  name?: string
  className?: string
}

function Avatar(props: AvatarProps) {
  const avatar = props.img.startsWith('http') ? props.img : `https://clippingkk-cdn.annatarhe.com/${props.img}-copyrightDB`
  return (
    <img
      src={avatar}
      alt={props.name}
      className={'w-24 h-24 rounded-full ' + props.className}
    />
  )
}

export default Avatar
