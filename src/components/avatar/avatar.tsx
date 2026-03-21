'use client'
import { CDN_DEFAULT_DOMAIN } from '@/constants/config'
import { useHover } from '@/hooks/dom'

type AvatarProps = {
  img: string
  name?: string
  className?: string
  editable?: boolean

  onClick?: () => any
  isPremium?: boolean
}

function Avatar(props: AvatarProps) {
  const { isPremium } = props
  const avatar = props.img.startsWith('http')
    ? props.img
    : `${CDN_DEFAULT_DOMAIN}/${props.img}`

  let cls = props.className || ''

  if (!cls && !cls.includes('w-')) {
    cls += ' w-24 h-24 '
  }

  if (isPremium) {
    cls +=
      ' px-1 py-1 rounded-full bg-linear-to-br from-indigo-400 to-cyan-400 rounded-full'
  }

  const { ref, isHovering } = useHover<HTMLDivElement>()

  if (props.img === '') {
    return (
      <div
        className={`animate-pulse rounded-full bg-gray-500 ${cls}`}
        onClick={props.onClick}
      />
    )
  }
  return (
    <div className={`relative ${cls}`} ref={ref}>
      <img
        src={avatar}
        alt={props.name}
        className={'h-full w-full rounded-full'}
      />
      {props.editable && (
        <div
          className="hover:bg-opacity-40 absolute inset-0 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-gray-900 hover:backdrop-blur-sm"
          onClick={props.onClick}
        >
          {isHovering && (
            <span className="with-fade-in text-lg text-white select-none">
              Edit
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default Avatar
