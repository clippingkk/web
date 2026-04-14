'use client'

import Tooltip from '@annatarhe/lake-ui/tooltip'
import { Ellipsis, LogOut, QrCode, Search, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { checkIsPremium } from '@/compute/user'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import profile from '@/utils/profile'

import AvatarOnNavigationBar from './avatar'
import { onCleanServerCookie } from './logout'

type DropdownProps = {
  children: React.ReactNode
}

function Dropdown({ children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label="More options"
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Ellipsis className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-950"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

type MenuItemProps = {
  href?: string
  onClick?: () => void
  tone?: 'default' | 'danger'
  icon: React.ReactNode
  children: React.ReactNode
}

function MenuItem(props: MenuItemProps) {
  const { href, onClick, tone = 'default', icon, children } = props
  const className = cn(
    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
    tone === 'danger'
      ? 'text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
  )

  const iconClassName = cn(
    'shrink-0',
    tone === 'danger'
      ? 'text-red-500 dark:text-red-300'
      : 'text-slate-500 dark:text-slate-400'
  )

  if (href) {
    return (
      <Link href={href as any} className={className}>
        <span className={iconClassName}>{icon}</span>
        <span>{children}</span>
      </Link>
    )
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      <span className={iconClassName}>{icon}</span>
      <span>{children}</span>
    </button>
  )
}

type LoggedNavigationBarProps = {
  profile: {
    name: string
    avatar: string
    premiumEndAt: string
  }
  uidOrDomain: string | number
  onPhoneLogin: () => void
  onSearch: () => void
}

function LoggedNavigationBar(props: LoggedNavigationBarProps) {
  const { uidOrDomain, onPhoneLogin, onSearch, profile: profileData } = props
  const { t } = useTranslation(undefined, 'navigation')
  const router = useRouter()
  const isPremium = checkIsPremium(profileData.premiumEndAt)

  const handleLogout = useCallback(async () => {
    await onCleanServerCookie()
    profile.onLogout()
    toast.success(t('app.menu.logout.success') || 'Bye bye')
    router.push('/')
  }, [router, t])

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex h-8 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={t('app.menu.search.title')}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{t('app.menu.search.title')}</span>
        </button>

        <Tooltip content={t('app.menu.settings')}>
          <Link
            href={`/dash/${uidOrDomain}/settings/web`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={t('app.menu.settings')}
          >
            <Settings className="h-4 w-4" />
          </Link>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/dash/${uidOrDomain}/profile`}
          className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <AvatarOnNavigationBar
            avatarUrl={profileData.avatar}
            size={28}
            isPremium={isPremium}
          />
          <span className="max-w-28 min-w-0 truncate text-sm font-medium text-slate-900 dark:text-white">
            {profileData.name}
          </span>
        </Link>

        <Dropdown>
          <div className="flex flex-col gap-1">
            <MenuItem
              href={`/dash/${uidOrDomain}/profile`}
              icon={<User className="h-4 w-4" />}
            >
              {t('app.menu.my')}
            </MenuItem>

            <MenuItem
              href={`/dash/${uidOrDomain}/settings/web`}
              icon={<Settings className="h-4 w-4" />}
            >
              {t('app.menu.settings')}
            </MenuItem>

            <MenuItem
              onClick={onPhoneLogin}
              icon={<QrCode className="h-4 w-4" />}
            >
              {t('app.menu.loginByQRCode.title')}
            </MenuItem>

            <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />

            <MenuItem
              onClick={handleLogout}
              tone="danger"
              icon={<LogOut className="h-4 w-4" />}
            >
              {t('app.menu.logout.title')}
            </MenuItem>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}

export default LoggedNavigationBar
