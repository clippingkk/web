'use client'

import Modal from '@annatarhe/lake-ui/modal'
import {
  ArrowUpTrayIcon,
  BookOpenIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import clsx from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useCallback, useState } from 'react'
import logo from '@/assets/logo.png'
import { useTranslation } from '@/i18n/client'
import type { ProfileQuery } from '@/schema/generated'
import LinkIndicator from '../link-indicator'
import { useCtrlP } from '../searchbar/hooks'
import SearchBar from '../searchbar/searchbar'
import LoggedNavigationBar from './authed'
import LoginByQRCode from './login-by-qrcode'
import styles from './navigation-bar.module.css'

const leftMenu = [
  {
    emoji: () => <BookOpenIcon className='h-6 w-6 dark:text-white' />,
    alt: 'read',
    dest: (id: number | string) => `/dash/${id}/home`,
    targetSegment: 'home',
  },
  {
    emoji: () => <Squares2X2Icon className='h-6 w-6 dark:text-white' />,
    alt: 'square',
    dest: (id: number | string) => `/dash/${id}/square`,
    targetSegment: 'square',
  },
  {
    emoji: () => <ArrowUpTrayIcon className='h-6 w-6 dark:text-white' />,
    alt: 'upload',
    dest: (id: number | string) => `/dash/${id}/upload`,
    targetSegment: 'upload',
  },
  // {
  //   emoji: () => <UserCircleIcon className='w-6 h-6 dark:text-white' />,
  //   alt: 'my',
  //   dest: (id: number | string) => `/dash/${id}/profile`,
  // },
]

type NavigationBarProps = {
  myProfile?: ProfileQuery['me']
}

function NavigationBar(props: NavigationBarProps) {
  const { myProfile: profile } = props

  const { visible, setVisible } = useCtrlP()
  const onSearchbarClose = useCallback(() => {
    setVisible(false)
  }, [setVisible])

  const [loginByQRCodeModalVisible, setLoginByQRCodeModalVisible] =
    useState(false)

  const { t } = useTranslation(undefined, 'navigation')
  // const homeLink = getMyHomeLink(profile)
  const activeSegment = useSelectedLayoutSegment()

  return (
    <nav
      className={
        `${styles.navbar 
        } bg-opacity-50 dark:bg-opacity-80 with-slide-in sticky top-0 z-30 flex w-full items-center justify-around bg-gray-800 py-4 shadow-lg backdrop-blur-xl backdrop-filter`
      }
    >
      <div className='flex items-center justify-around'>
        <Image
          src={logo}
          alt='clippingkk logo'
          className='mr-2 h-10 w-10 rounded-sm lg:mr-12 lg:h-20 lg:w-20'
          width={40}
          height={40}
        />
        {profile ? (
          <ul className='with-slide-in ml-2 flex lg:ml-6'>
            {leftMenu.map((item, index) => (
              <li
                className={clsx(
                  'mr-3 cursor-pointer items-center rounded-full bg-linear-to-br px-4 py-2 text-gray-200 transition-all duration-150 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:shadow-lg active:scale-95 lg:mr-6 dark:text-white',
                  {
                    'from-indigo-500 via-purple-500 to-pink-500 dark:text-gray-500':
                      activeSegment === item.targetSegment,
                  },
                  item.alt === 'upload' ? 'hidden md:flex' : 'flex'
                )}
                key={index}
              >
                <Link
                  className='flex items-center'
                  href={
                    item.dest(
                      profile.domain.length > 2 ? profile.domain : profile.id
                    ) as any
                  }
                >
                  <LinkIndicator>{item.emoji()}</LinkIndicator>
                  <span className='ml-2 lg:text-lg'>
                    {t(`app.menu.${item.alt}`) ?? ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {profile ? (
        <LoggedNavigationBar
          onSearch={() => setVisible(true)}
          uidOrDomain={profile.domain.length > 2 ? profile.domain : profile.id}
          onPhoneLogin={() => setLoginByQRCodeModalVisible(true)}
          profile={profile}
        />
      ) : (
        <Link href='/auth/auth-v4'>
          <h2 className='font-bold text-white'>{t('app.slogan')}</h2>
        </Link>
      )}
      <SearchBar
        profile={profile}
        visible={visible}
        onClose={onSearchbarClose}
      />
      <Modal
        isOpen={loginByQRCodeModalVisible}
        onClose={() => {
          setLoginByQRCodeModalVisible(false)
        }}
        title='Login by QR Code'
      >
        <LoginByQRCode />
      </Modal>
    </nav>
  );
}

export default NavigationBar
