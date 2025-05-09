'use client'

import React, { useCallback, useState } from 'react'
import Image from 'next/image'
import clsx from 'classnames'
import { useTranslation } from '@/i18n/client'
import Link from 'next/link'
import logo from '../../assets/logo.png'
import SearchBar from '../searchbar/searchbar'
import { useCtrlP } from '../searchbar/hooks'
import { Modal } from '@mantine/core'
import LoginByQRCode from './login-by-qrcode'
import LoggedNavigationBar from './authed'
import { ArrowUpTrayIcon, BookOpenIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { useSelectedLayoutSegment } from 'next/navigation'
import styles from './navigation-bar.module.css'
import { ProfileQuery } from '../../schema/generated'
import LinkIndicator from '../link-indicator'

const leftMenu = [
  {
    emoji: () => <BookOpenIcon className='w-6 h-6 dark:text-white' />,
    alt: 'read',
    dest: (id: number | string) => `/dash/${id}/home`,
    targetSegment: 'home',
  },
  {
    emoji: () => <Squares2X2Icon className='w-6 h-6 dark:text-white' />,
    alt: 'square',
    dest: (id: number | string) => `/dash/${id}/square`,
    targetSegment: 'square',
  },
  {
    emoji: () => <ArrowUpTrayIcon className='w-6 h-6 dark:text-white' />,
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
  }, [])

  const [loginByQRCodeModalVisible, setLoginByQRCodeModalVisible] = useState(false)

  const { t } = useTranslation()
  // const homeLink = getMyHomeLink(profile)
  const activeSegment = useSelectedLayoutSegment()

  return (
    <nav className={styles.navbar + ' bg-gray-800 bg-opacity-50 dark:bg-opacity-80 sticky top-0 py-4 w-full flex justify-around items-center z-30 shadow-lg backdrop-filter backdrop-blur-xl with-slide-in'}>
      <div className='flex justify-around items-center'>
        <Image
          src={logo}
          alt="clippingkk logo"
          className='w-10 h-10 lg:w-20 lg:h-20 mr-2 lg:mr-12 rounded-sm'
          width={40}
          height={40}
        />
        {profile ? (
          <ul className='flex ml-2 lg:ml-6 with-slide-in'>
            {leftMenu.map((item, index) => (
              <li
                className={clsx('mr-3 dark:text-white items-center lg:mr-6 cursor-pointer px-4 py-2 rounded-full bg-linear-to-br transition-all hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-gray-200 duration-150 hover:shadow-lg active:scale-95', {
                  'from-indigo-500 via-purple-500 to-pink-500 dark:text-gray-500': activeSegment === item.targetSegment,
                }, item.alt === 'upload' ? 'hidden md:flex' : 'flex')}
                key={index}
              >
                <Link
                  className='flex items-center'
                  href={item.dest(profile.domain.length > 2 ? profile.domain : profile.id)}
                >
                  <>
                    <LinkIndicator>
                      {item.emoji()}
                    </LinkIndicator>
                    <span
                      className=' ml-2 lg:text-lg'
                    >
                      {t(`app.menu.${item.alt}`) ?? ''}
                    </span>
                  </>
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
        <Link href='/auth/auth-v4' legacyBehavior>
          <h2 className='text-white font-bold'>
            {t('app.slogan')}
          </h2>
        </Link>
      )}
      <SearchBar profile={profile} visible={visible} onClose={onSearchbarClose} />
      <Modal
        withCloseButton={false}
        opened={loginByQRCodeModalVisible}
        onClose={() => { setLoginByQRCodeModalVisible(false) }}
        centered
        overlayProps={{ blur: 6 }}
      >
        <LoginByQRCode />
      </Modal>
    </nav>
  )
}

export default NavigationBar
