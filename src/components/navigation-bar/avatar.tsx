import { Avatar, AvatarProps } from '@mantine/core'
import clsx from 'classnames'
import React from 'react'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'

type AvatarOnNavigationBarProps = {
  avatarUrl?: string
  size?: AvatarProps['size']
  isPremium: boolean
}

function AvatarOnNavigationBar(props: AvatarOnNavigationBarProps) {
  const { avatarUrl, size, isPremium } = props

  const avatar = avatarUrl?.startsWith('http') ? avatarUrl : `${CDN_DEFAULT_DOMAIN}/${avatarUrl}`

  return (
    <div
      className={clsx(isPremium && 'px-1 py-1 rounded-full bg-linear-to-br from-indigo-400 to-cyan-400')}>
      <Avatar
        src={avatar}
        size={size}
        radius={'xl'}
      />
    </div>
  )
}

export default AvatarOnNavigationBar
