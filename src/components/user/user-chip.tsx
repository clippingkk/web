import Avatar from '@annatarhe/lake-ui/avatar'
import type { Route } from 'next'
import Link from 'next/link'
import type React from 'react'

import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/image'

type UserChipProps = {
  href: Route
  name: string
  avatar?: string | null
  isPremium?: boolean
  size?: 'sm' | 'md'
  /** Secondary line, e.g. "@domain" or a date. */
  detail?: React.ReactNode
  className?: string
}

function UserChip(props: UserChipProps) {
  const {
    href,
    name,
    avatar,
    isPremium,
    size = 'sm',
    detail,
    className,
  } = props
  return (
    <Link
      href={href}
      className={cn(
        'group rounded-lake-control inline-flex min-w-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-lake-ring',
        className
      )}
    >
      <Avatar
        src={avatar ? resolveMediaUrl(avatar) : null}
        name={name}
        size={size === 'md' ? 'md' : 'sm'}
        ring={isPremium ? 'premium' : 'none'}
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'text-lake-fg group-hover:text-lake-accent-text truncate font-medium transition-colors duration-150',
            size === 'md' ? 'text-base' : 'text-sm'
          )}
        >
          {name}
        </span>
        {detail ? <span className="type-meta truncate">{detail}</span> : null}
      </span>
    </Link>
  )
}

export default UserChip
