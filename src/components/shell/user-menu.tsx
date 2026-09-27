'use client'

import Avatar from '@annatarhe/lake-ui/avatar'
import Badge from '@annatarhe/lake-ui/badge'
import Menu, { type MenuEntry } from '@annatarhe/lake-ui/menu'
import {
  LogOut,
  Monitor,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  UserRoundCog,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

import { useTheme } from '@/components/theme/use-theme'
import { useTranslation } from '@/i18n/client'
import { resolveMediaUrl } from '@/utils/image'
import profile from '@/utils/profile'
import { dashHref } from '@/utils/profile.utils'

import type { ShellViewer } from './types'

type UserMenuProps = {
  viewer: ShellViewer
}

function UserMenu({ viewer }: UserMenuProps) {
  const { t } = useTranslation(undefined, 'common')
  const { preference, setPreference } = useTheme()

  const onSignOut = useCallback(async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (!response.ok) {
      toast.error(t('shell.userMenu.signOutFailed'))
      return
    }
    profile.onLogout()
    toast.success(t('shell.userMenu.signedOut'))
    window.location.assign('/')
  }, [t])

  const avatar = viewer.avatar ? resolveMediaUrl(viewer.avatar) : null
  const items: MenuEntry[] = [
    {
      key: 'profile',
      label: t('shell.userMenu.profile'),
      icon: <UserRound className="size-4" />,
      render: <Link href={dashHref(viewer.slug, 'profile')} />,
    },
    {
      key: 'settings',
      label: t('shell.userMenu.settings'),
      icon: <Settings className="size-4" />,
      render: <Link href={dashHref(viewer.slug, 'settings/web')} />,
    },
    { type: 'separator', key: 'sep-theme' },
    { type: 'label', key: 'theme-label', label: t('shell.userMenu.theme') },
    {
      type: 'radio',
      key: 'theme-system',
      label: (
        <span className="inline-flex items-center gap-2">
          <Monitor className="size-4" />
          {t('shell.userMenu.themeSystem')}
        </span>
      ),
      checked: preference === 'system',
      onSelect: () => setPreference('system'),
    },
    {
      type: 'radio',
      key: 'theme-light',
      label: (
        <span className="inline-flex items-center gap-2">
          <Sun className="size-4" />
          {t('shell.userMenu.themeLight')}
        </span>
      ),
      checked: preference === 'light',
      onSelect: () => setPreference('light'),
    },
    {
      type: 'radio',
      key: 'theme-dark',
      label: (
        <span className="inline-flex items-center gap-2">
          <Moon className="size-4" />
          {t('shell.userMenu.themeDark')}
        </span>
      ),
      checked: preference === 'dark',
      onSelect: () => setPreference('dark'),
    },
    { type: 'separator', key: 'sep-account' },
    {
      key: 'account',
      label: t('shell.userMenu.account'),
      icon: <UserRoundCog className="size-4" />,
      onSelect: () => window.location.assign('/api/auth/account'),
    },
    ...(viewer.isAdmin
      ? [
          {
            key: 'admin',
            label: t('shell.userMenu.admin'),
            icon: <ShieldCheck className="size-4" />,
            render: <Link href={dashHref(viewer.slug, 'admin')} />,
          } satisfies MenuEntry,
        ]
      : []),
    { type: 'separator', key: 'sep-signout' },
    {
      key: 'sign-out',
      label: t('shell.userMenu.signOut'),
      icon: <LogOut className="size-4" />,
      tone: 'danger',
      onSelect: onSignOut,
    },
  ]

  return (
    <Menu
      label={t('shell.userMenu.label')}
      trigger={
        <button
          type="button"
          className="focus-visible:ring-lake-ring rounded-full outline-none focus-visible:ring-2"
          aria-label={t('shell.userMenu.label')}
        >
          <Avatar
            src={avatar}
            name={viewer.name}
            size="sm"
            ring={viewer.isPremium ? 'premium' : 'none'}
          />
        </button>
      }
      header={
        <div className="flex min-w-0 items-center gap-3 px-1 py-1">
          <Avatar src={avatar} name={viewer.name} size="md" />
          <div className="min-w-0">
            <p className="text-lake-fg truncate text-sm font-medium">
              {viewer.name}
            </p>
            {viewer.isPremium ? (
              <Badge tone="warning" variant="soft" size="sm">
                {t('shell.userMenu.premium')}
              </Badge>
            ) : null}
          </div>
        </div>
      }
      items={items}
    />
  )
}

export default UserMenu
