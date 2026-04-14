'use client'

import Modal from '@annatarhe/lake-ui/modal'
import { BookOpen, LayoutGrid, Upload } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useCallback, useState } from 'react'

import logoDark from '@/assets/logo-dark.svg'
import logoLight from '@/assets/logo-light.svg'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import type { ProfileQuery } from '@/schema/generated'
import { getUserSlug } from '@/utils/profile.utils'

import SearchBar from '../searchbar/searchbar'
import LoggedNavigationBar from './authed'
import LoginByQRCode from './login-by-qrcode'

const leftMenu = [
  {
    icon: BookOpen,
    alt: 'read',
    dest: (id: number | string) => `/dash/${id}/home`,
    targetSegment: 'home',
  },
  {
    icon: LayoutGrid,
    alt: 'square',
    dest: (id: number | string) => `/dash/${id}/square`,
    targetSegment: 'square',
  },
  {
    icon: Upload,
    alt: 'upload',
    dest: (id: number | string) => `/dash/${id}/upload`,
    targetSegment: 'upload',
  },
]

type NavigationBarProps = {
  myProfile?: ProfileQuery['me']
}

function NavigationBar(props: NavigationBarProps) {
  const { myProfile: profile } = props
  const { t } = useTranslation(undefined, 'navigation')
  const activeSegment = useSelectedLayoutSegment()
  const [searchVisible, setSearchVisible] = useState(false)
  const [loginByQRCodeModalVisible, setLoginByQRCodeModalVisible] =
    useState(false)

  const onSearchbarClose = useCallback(() => {
    setSearchVisible(false)
  }, [])

  const profileSlug = profile ? getUserSlug(profile) : null
  const brandHref = profileSlug ? `/dash/${profileSlug}/home` : '/'

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/92">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2 lg:flex-row lg:items-center lg:gap-3">
          <div className="flex items-center justify-between gap-3 lg:w-auto lg:shrink-0">
            <Link
              href={brandHref as any}
              className="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-1 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900">
                <Image
                  src={logoLight}
                  alt="clippingkk logo"
                  className="h-5 w-5 object-contain dark:hidden"
                  width={20}
                  height={20}
                  priority
                />
                <Image
                  src={logoDark}
                  alt="clippingkk logo"
                  className="hidden h-5 w-5 object-contain dark:block"
                  width={20}
                  height={20}
                  priority
                />
              </span>
              <span className="min-w-0 truncate text-sm font-semibold text-slate-900 uppercase dark:text-slate-100">
                ClippingKK
              </span>
            </Link>

            {!profile ? (
              <Link
                href="/auth/auth-v4"
                className="inline-flex items-center rounded-xl bg-blue-400 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
              >
                Login
              </Link>
            ) : null}
          </div>

          {profile && profileSlug ? (
            <div className="min-w-0 flex-1">
              <ul className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200/60 bg-slate-50 p-1 dark:border-slate-800/60 dark:bg-slate-900/50">
                {leftMenu.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSegment === item.targetSegment
                  return (
                    <li key={item.alt} className="min-w-0">
                      <Link
                        href={item.dest(profileSlug) as any}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex min-h-9 items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors sm:justify-start sm:px-3.5',
                          isActive
                            ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {t(`app.menu.${item.alt}`) ?? ''}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {profile && profileSlug ? (
            <div className="lg:w-auto lg:shrink-0">
              <LoggedNavigationBar
                onSearch={() => setSearchVisible(true)}
                uidOrDomain={profileSlug}
                onPhoneLogin={() => setLoginByQRCodeModalVisible(true)}
                profile={profile}
              />
            </div>
          ) : null}
        </div>
      </nav>

      <SearchBar
        profile={profile}
        visible={searchVisible}
        onClose={onSearchbarClose}
      />
      <Modal
        isOpen={loginByQRCodeModalVisible}
        onClose={() => {
          setLoginByQRCodeModalVisible(false)
        }}
        title="Login by QR Code"
      >
        <LoginByQRCode />
      </Modal>
    </>
  )
}

export default NavigationBar
