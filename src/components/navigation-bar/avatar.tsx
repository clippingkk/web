import clsx from 'classnames'
import Image from 'next/image'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'

type AvatarOnNavigationBarProps = {
  avatarUrl?: string
  size?: number
  isPremium: boolean
}

function AvatarOnNavigationBar(props: AvatarOnNavigationBarProps) {
  const { avatarUrl, size = 24, isPremium } = props

  const avatar = avatarUrl?.startsWith('http')
    ? avatarUrl
    : `${CDN_DEFAULT_DOMAIN}/${avatarUrl}`

  return (
    <div
      className={clsx(
        isPremium &&
          'rounded-full bg-linear-to-br from-indigo-400 to-cyan-400 px-1 py-1'
      )}
    >
      <Image
        src={avatar}
        width={size}
        height={size}
        alt='avatar'
        className='rounded-full'
      />
    </div>
  )
}

export default AvatarOnNavigationBar
