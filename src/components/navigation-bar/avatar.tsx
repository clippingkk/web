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
        'relative shrink-0 rounded-full p-0.5',
        isPremium
          ? 'bg-linear-to-br from-amber-300 via-sky-400 to-cyan-400'
          : 'bg-slate-200 dark:bg-slate-800'
      )}
    >
      <Image
        src={avatar}
        width={size}
        height={size}
        alt="avatar"
        className="rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
      />
    </div>
  )
}

export default AvatarOnNavigationBar
