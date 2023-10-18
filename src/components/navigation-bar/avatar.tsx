import { Avatar } from '@mantine/core'
import clsx from 'classnames'
import React from 'react'

type AvatarOnNavigationBarProps = {
  avatarUrl: string
  isPremium: boolean
}

function AvatarOnNavigationBar(props: AvatarOnNavigationBarProps) {
  const { avatarUrl, isPremium } = props
  return (
    <div
      className={clsx(isPremium && 'px-1 py-1 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400')}>
      <Avatar
        src={avatarUrl}
        radius={'xl'}
      />
    </div>
  )
}

export default AvatarOnNavigationBar
