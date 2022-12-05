import React from 'react'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { useHover } from '../../hooks/dom'

type AvatarProps = {
  img: string
  name?: string
  className?: string
  editable?: boolean
  onClick?: () => any
}

function Avatar(props: AvatarProps) {
  const avatar = props.img.startsWith('http') ? props.img : `${CDN_DEFAULT_DOMAIN}/${props.img}`

  let cls = props.className || ''

  if (!cls && !cls.includes('w-')) {
    cls += ' w-24 h-24'
  }

  const { ref, isHovering } = useHover<HTMLDivElement>()

  if (props.img === '') {
    return (
      <div className={' rounded-full bg-gray-500 animate-pulse ' + cls} />
    )
  }
  return (
    <div className={'relative ' + cls} ref={ref}>
      <img
        src={avatar}
        alt={props.name}
        className={'rounded-full w-full h-full '}
      />
      {props.editable && (
        <div
          className=' rounded-full flex justify-center items-center absolute inset-0 hover:bg-gray-900 hover:bg-opacity-40 hover:backdrop-blur transition-all duration-300'
          onClick={props.onClick}
        >
          {isHovering && (
            <span className=' text-white with-fade-in select-none text-lg'>Edit</span>
          )}
        </div>
      )}
    </div>
  )
}

export default Avatar
