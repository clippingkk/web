'use client'

import { useTranslation } from '@/i18n/client'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { LogOut, Search, Settings, Smartphone, User } from 'lucide-react'
import mixpanel from 'mixpanel-browser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { useIsPremium } from '@/hooks/profile'
import { cn } from '@/utils/cn'
import profile from '@/utils/profile'
import LinkIndicator from '../link-indicator'
import AvatarOnNavigationBar from './avatar'
import { onCleanServerCookie } from './logout'

// Custom Dropdown component
type DropdownProps = {
  trigger: React.ReactNode
  children: React.ReactNode
}

const Dropdown = ({ trigger, children }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={toggleDropdown}>{trigger}</div>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90"
          style={{
            transformOrigin: 'top right',
            animation: 'scaleIn 200ms ease-out forwards',
          }}
        >
          <style jsx global>{`
            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
          <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-t border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"></div>
          {children}
        </div>
      )}
    </div>
  )
}

// Custom Divider component
const Divider = ({ className = '' }: { className?: string }) => (
  <hr
    className={`border-t border-slate-200 dark:border-slate-700 ${className}`}
  />
)

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
  const isPremium = useIsPremium(profileData.premiumEndAt)

  const handleLogout = useCallback(async () => {
    await onCleanServerCookie()
    profile.onLogout()
    toast.success(t('app.menu.logout.success') || 'Bye bye')
    mixpanel.track('logout')
    router.push('/')
  }, [router, t])

  return (
    <nav aria-label="User navigation">
      <ul className="with-slide-in flex items-center gap-4">
        {/* Search Button */}
        <li>
          <button
            onClick={onSearch}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl"
            aria-label={t('app.menu.search.title')}
          >
            <Search size={18} />
            <span>{t('app.menu.search.title')}</span>
          </button>
        </li>

        {/* Settings Button */}
        <li>
          <Tooltip content={t('app.menu.settings')}>
            <Link
              href={`/dash/${uidOrDomain}/settings/web`}
              className="flex items-center justify-center rounded-full bg-slate-200 p-2 transition-colors duration-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
              aria-label={t('app.menu.settings')}
            >
              <LinkIndicator>
                <Settings
                  size={20}
                  className="text-slate-700 dark:text-slate-200"
                />
              </LinkIndicator>
            </Link>
          </Tooltip>
        </li>

        {/* User Avatar with Dropdown */}
        <li>
          <Dropdown
            trigger={
              <button className="relative rounded-full transition-transform hover:scale-105 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
                <AvatarOnNavigationBar
                  avatarUrl={profileData.avatar}
                  isPremium={isPremium}
                />
              </button>
            }
          >
            <div className="flex flex-col gap-2">
              {/* User Profile */}
              <div className="mb-2 flex items-center gap-3 p-2">
                <AvatarOnNavigationBar
                  avatarUrl={profileData.avatar}
                  size={40}
                  isPremium={isPremium}
                />
                <div className="flex flex-col gap-4">
                  <Tooltip content={profileData.name} noWrap>
                    <h3 className="max-w-48 overflow-hidden text-lg font-bold text-ellipsis dark:text-white">
                      {profileData.name}
                    </h3>
                  </Tooltip>
                  <Link
                    href={`/dash/${uidOrDomain}/profile`}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {t('app.menu.viewProfile')}
                  </Link>
                </div>
              </div>

              <Divider className="my-1" />

              {/* Menu Items */}
              <div className="flex flex-col">
                <Link
                  href={`/dash/${uidOrDomain}/profile`}
                  className="flex items-center gap-2 rounded-lg p-3 transition-all duration-200 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800/50"
                >
                  <LinkIndicator>
                    <User
                      size={18}
                      className="text-slate-700 dark:text-slate-200"
                    />
                  </LinkIndicator>
                  <span>{t('app.menu.my')}</span>
                </Link>

                <button
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-all duration-200 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800/50"
                  onClick={onPhoneLogin}
                >
                  <Smartphone
                    size={18}
                    className="text-slate-700 dark:text-slate-200"
                  />
                  <span>{t('app.menu.loginByQRCode.title')}</span>
                </button>

                <Link
                  href={`/dash/${uidOrDomain}/settings/web`}
                  className="flex items-center gap-2 rounded-lg p-3 transition-all duration-200 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800/50"
                >
                  <LinkIndicator>
                    <Settings
                      size={18}
                      className="text-slate-700 dark:text-slate-200"
                    />
                  </LinkIndicator>
                  <span>{t('app.menu.settings')}</span>
                </Link>

                <Divider className="my-2" />

                <button
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50',
                    'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  )}
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="text-red-400" />
                  <span>{t('app.menu.logout.title')}</span>
                </button>
              </div>
            </div>
          </Dropdown>
        </li>
      </ul>
    </nav>
  )
}

export default LoggedNavigationBar
