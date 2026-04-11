import Image from 'next/image'

import { cn } from '../../lib/utils'
import { resolveMediaUrl } from '../../utils/image'

type AvatarOnNavigationBarProps = {
  avatarUrl?: string
  size?: number
  isPremium: boolean
}

function AvatarOnNavigationBar(props: AvatarOnNavigationBarProps) {
  const { avatarUrl, size = 24, isPremium } = props

  const avatar = resolveMediaUrl(avatarUrl)

  return (
    <div
      className={cn(
        isPremium &&
          'rounded-full bg-linear-to-br from-indigo-400 to-cyan-400 px-1 py-1'
      )}
    >
      <Image
        src={avatar}
        width={size}
        height={size}
        alt="avatar"
        className="rounded-full"
      />
    </div>
  )
}

export default AvatarOnNavigationBar
