'use client'

import Tooltip from '@annatarhe/lake-ui/tooltip'
import { useCallback, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useTranslation } from '@/i18n/client'
import { Search, Settings, LogOut, Smartphone, User } from 'lucide-react'
import toast from 'react-hot-toast'
import mixpanel from 'mixpanel-browser'

import { USER_LOGOUT, UserContent } from '../../store/user/type'
import AvatarOnNavigationBar from './avatar'
import { useIsPremium } from '../../hooks/profile'
import profile from '../../utils/profile'
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={toggleDropdown}>
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 p-4 border border-slate-200 dark:border-slate-700 shadow-2xl"
          style={{
            transformOrigin: 'top right',
            animation: 'scaleIn 200ms ease-out forwards'
          }}
        >
          <style jsx global>{`
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
          <div className="absolute right-4 -top-2 w-4 h-4 bg-white dark:bg-slate-900 rotate-45 border-t border-l border-slate-200 dark:border-slate-700"></div>
          {children}
        </div>
      )}
    </div>
  )
}

// Custom Divider component
const Divider = ({ className = '' }: { className?: string }) => (
  <hr className={`border-t border-slate-200 dark:border-slate-700 ${className}`} />
)

type MenuItemProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  href?: string
  color?: string
}

const MenuItem = ({ icon, label, onClick, href, color = 'default' }: MenuItemProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component: any = href ? Link : 'button'
  const props = href ? { href } : { onClick, type: 'button' }
  
  return (
    <Component
      {...props}
      className={`w-full flex items-center gap-2 p-3 rounded-lg transition-all duration-200 ${color === 'danger' 
        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
        : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Component>
  )
}

type LoggedNavigationBarProps = {
  profile: UserContent
  uidOrDomain: string | number
  onPhoneLogin: () => void
  onSearch: () => void
}

function LoggedNavigationBar(props: LoggedNavigationBarProps) {
  const { uidOrDomain, onPhoneLogin, onSearch, profile: profileData } = props
  const { t } = useTranslation()
  const router = useRouter()
  const dispatch = useDispatch()
  const isPremium = useIsPremium(profileData.premiumEndAt)

  const handleLogout = useCallback(async () => {
    await onCleanServerCookie()
    profile.onLogout()
    dispatch({ type: USER_LOGOUT })
    toast.success(t('app.menu.logout.success') || 'Bye bye')
    mixpanel.track('logout')
    router.push('/')
  }, [dispatch, router, t])

  return (
    <nav aria-label="User navigation">
      <ul className="flex items-center gap-4 with-slide-in">
        {/* Search Button */}
        <li>
          <button
            onClick={onSearch}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                     text-white px-4 py-2 rounded-full flex items-center gap-2 
                     shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
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
              className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 
                         transition-colors duration-200 flex items-center justify-center"
              aria-label={t('app.menu.settings')}
            >
              <Settings size={20} className="text-slate-700 dark:text-slate-200" />
            </Link>
          </Tooltip>
        </li>
        
        {/* User Avatar with Dropdown */}
        <li>
          <Dropdown
            trigger={
              <button className="relative transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full">
                <AvatarOnNavigationBar
                  avatarUrl={profileData.avatar}
                  isPremium={isPremium}
                />
              </button>
            }
          >
            <div className="flex flex-col gap-2">
              {/* User Profile */}
              <div className="flex items-center gap-3 p-2 mb-2">
                <AvatarOnNavigationBar
                  avatarUrl={profileData.avatar}
                  size="md"
                  isPremium={isPremium}
                />
                <div>
                  <h3 className="font-bold text-lg">{profileData.name}</h3>
                  <Link 
                    href={`/dash/${uidOrDomain}/profile`}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t('app.menu.viewProfile')}
                  </Link>
                </div>
              </div>
              
              <Divider className="my-1" />
              
              {/* Menu Items */}
              <div className="flex flex-col">
                <MenuItem 
                  icon={<User size={18} />}
                  label={t('app.menu.profile')}
                  href={`/dash/${uidOrDomain}/profile`}
                />
                
                <MenuItem 
                  icon={<Smartphone size={18} />}
                  label={t('app.menu.loginByQRCode.title')}
                  onClick={onPhoneLogin}
                />
                
                <MenuItem 
                  icon={<Settings size={18} />}
                  label={t('app.menu.settings')}
                  href={`/dash/${uidOrDomain}/settings/web`}
                />
                
                <Divider className="my-2" />
                
                <MenuItem 
                  icon={<LogOut size={18} />}
                  label={t('app.menu.logout')}
                  onClick={handleLogout}
                  color="danger"
                />
              </div>
            </div>
          </Dropdown>
        </li>
      </ul>
    </nav>
  )
}

export default LoggedNavigationBar
