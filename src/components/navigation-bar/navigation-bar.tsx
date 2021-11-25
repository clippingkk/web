import React, { useCallback } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { execLogout, TUserState, UserContent } from '../../store/user/type'
// import Tooltip from 'rc-tooltip'
import { TGlobalStore } from '../../store'
import { useTranslation } from 'react-i18next';
import Tooltip from '../tooltip/Tooltip';
import styles from './navigation-bar.module.css'
import { useRouter } from 'next/router'
import Link from 'next/link'
import logo from '../../assets/logo.png'
import { propTypes } from 'qrcode.react'

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
  const { push } = useRouter()

  const onLogout = useCallback(() => {
    dispatch(execLogout(push))
  }, [])

  const { t } = useTranslation()

  return (
    <nav className={styles.navbar + ' bg-gray-800 bg-opacity-50 dark:bg-opacity-80 sticky top-0 py-4 w-full flex justify-around items-center z-30 shadow-lg backdrop-filter backdrop-blur-xl'}>
      <div className='flex justify-around items-center'>
        <Image
          src={logo}
          alt="clippingkk logo"
          className='w-10 h-10 lg:w-20 lg:h-20 mr-2 lg:mr-12'
          width={40}
          height={40}
        />
        <ul className='flex ml-2 lg:ml-12'>
          {leftMenu.map((item, index) => (
            <li className='mr-3 lg:mr-6 cursor-pointer' key={index}>
              <Tooltip
                placement='bottom'
                overlay={<span>{t(`app.menu.${item.alt}`)}</span>}
              >
                <Link
                  href={id === 0 ? '/auth/signin' : item.dest(id)}
                >
                  <span
                    className='text-3xl lg:text-4xl'
                    title={t(`app.menu.${item.alt}`)}
                  >
                    {item.emoji}
                  </span>
                </Link>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>
      <ul className='flex'>
        <li className='mr-6'>
          <Tooltip
            placement='bottom'
            overlay={<span>{t('app.menu.settings')}</span>}
          >
            <Link
              href={id === 0 ? '/auth/signin' : `/dash/${id}/settings`}
            >
              <a
                className='text-3xl lg:text-4xl'
                title={t('app.menu.settings')}
              >

                🛠
              </a>
            </Link>
          </Tooltip>
        </li>
        <li className='mr-6' onClick={onLogout}>
          <Tooltip
            placement='bottom'
            overlay={<span>{t('app.menu.logout')}</span>}
          >
            <span
              className='text-3xl lg:text-4xl'
              title={t('app.menu.logout')}
            >
              👋
            </span>
          </Tooltip>
        </li>
      </ul>
    </nav>
  )
}

export default NavigationBar
