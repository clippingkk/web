import React, { useCallback, useState } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { execLogout, TUserState, UserContent } from '../../store/user/type'
// import Tooltip from 'rc-tooltip'
import { TGlobalStore } from '../../store'
import { useTranslation } from 'react-i18next';
import Tooltip from '../tooltip/Tooltip';
import Link from 'next/link'
import logo from '../../assets/logo.png'
import SearchBar, { useCtrlP } from '../searchbar/searchbar'
import { Modal } from '@mantine/core'
import LoginByQRCode from './login-by-qrcode'
import styles from './navigation-bar.module.css'
import Cookies from 'js-cookie'

const leftMenu = [
  {
    emoji: '📙',
    alt: 'read',
    dest: (id: number | string) => `/dash/${id}/home`,
  },
  {
    emoji: '🎪',
    alt: 'square',
    dest: (id: number | string) => `/dash/${id}/square`,
  },
  {
    emoji: '🎈',
    alt: 'upload',
    dest: (id: number | string) => `/dash/${id}/upload`,
  },
  {
    emoji: '👼',
    alt: 'my',
    dest: (id: number | string) => `/dash/${id}/profile`,
  },
]

function NavigationBar() {
  const profile = useSelector<TGlobalStore, UserContent>(s => s.user.profile)

  const id = profile.domain.length > 2 ? profile.domain : profile.id

  const dispatch = useDispatch()

  const onLogout = useCallback(() => {
    Cookies.remove('token')
    Cookies.remove('uid')
    const push = () => {}
    dispatch(execLogout(push))
  }, [])

  const { visible, setVisible } = useCtrlP()
  const onSearchbarClose = useCallback(() => {
    setVisible(false)
  }, [])

  const [loginByQRCodeModalVisible, setLoginByQRCodeModalVisible] = useState(false)

  const { t } = useTranslation()

  return (
    <nav className={styles.navbar + ' bg-gray-800 bg-opacity-50 dark:bg-opacity-80 sticky top-0 py-4 w-full flex justify-around items-center z-30 shadow-lg backdrop-filter backdrop-blur-xl with-slide-in'}>
      <div className='flex justify-around items-center'>
        <Image
          src={logo}
          alt="clippingkk logo"
          className='w-10 h-10 lg:w-20 lg:h-20 mr-2 lg:mr-12'
          width={40}
          height={40}
        />
        {profile.id > 0 ? (
          <ul className='flex ml-2 lg:ml-12'>
            {leftMenu.map((item, index) => (
              <li className='mr-3 lg:mr-6 cursor-pointer' key={index}>
                <Tooltip
                  placement='bottom'
                  overlay={<span>{t(`app.menu.${item.alt}`)}</span>}
                >
                  <Link href={id === 0 ? '/auth/auth-v3' : item.dest(id)} legacyBehavior>
                    <span
                      className='text-3xl lg:text-4xl'
                      title={t(`app.menu.${item.alt}`) ?? ''}
                    >
                      {item.emoji}
                    </span>
                  </Link>
                </Tooltip>
              </li>
            ))}
          </ul>
        ) : (
          null
        )}
      </div>
      {profile.id > 0 ? (
        <ul className='flex'>
          <li className='mr-6'>
            <Tooltip
              placement='bottom'
              overlay={<span>{t('app.menu.loginByQRCode.title')}</span>}
            >
              <button
                className='text-3xl lg:text-4xl'
                title={t('app.menu.loginByQRCode.title') ?? ''}
                onClick={() => {
                  setLoginByQRCodeModalVisible(true)
                }}
              >
                📱
              </button>
            </Tooltip>
          </li>

          <li className='mr-6'>
            <Tooltip
              placement='bottom'
              overlay={<span>{t('app.menu.search.title')}</span>}
            >
              <button
                className='text-3xl lg:text-4xl'
                title={t('app.menu.search.title') ?? ''}
                onClick={() => {
                  setVisible(true)
                }}
              >
                🔍
              </button>
            </Tooltip>
          </li>

          <li className='mr-6'>
            <Tooltip
              placement='bottom'
              overlay={<span>{t('app.menu.settings')}</span>}
            >
              <Link
                href={id === 0 ? '/auth/auth-v3' : `/dash/${id}/settings`}
                className='text-3xl lg:text-4xl'
                title={t('app.menu.settings') ?? 'setting'}>
                
                  🛠
                
              </Link>
            </Tooltip>
          </li>
          <li className='mr-6' onClick={onLogout}>
            <Link href={'/'}>
            <Tooltip
              placement='bottom'
              overlay={<span>{t('app.menu.logout')}</span>}
            >
              <span
                className='text-3xl lg:text-4xl cursor-pointer'
                title={t('app.menu.logout') ?? 'logout'}
              >
                👋
              </span>
            </Tooltip>
            </Link>
          </li>
        </ul>
      ) : (
        <Link href='/auth/auth-v3' legacyBehavior>
          <h2 className='text-white font-bold'>
            {t('app.slogan')}
          </h2>
        </Link>
      )}
      <SearchBar visible={visible} onClose={onSearchbarClose} />
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
  );
}

export default NavigationBar
