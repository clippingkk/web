import React, { useCallback } from 'react'
import { Link } from '@reach/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect, useDispatch, useSelector } from 'react-redux'
import { execLogout } from '../../store/user/type';
// import Tooltip from 'rc-tooltip'
import { TGlobalStore } from '../../store'
import { useTranslation } from 'react-i18next';
import Tooltip from '../tooltip/Tooltip';
const styles = require('./navigation-bar.css').default

const leftMenu = [
  {
    emoji: '📙',
    alt: 'read',
    dest: (id: number) => `/dash/${id}/home`,
  },
  {
    emoji: '🎪',
    alt: 'square',
    dest: (id: number) => `/dash/${id}/square`,
  },
  {
    emoji: '🎈',
    alt: 'upload',
    dest: (id: number) => `/dash/${id}/upload`,
  },
  {
    emoji: '👼',
    alt: 'my',
    dest: (id: number) => `/dash/${id}/profile`,
  },
]

function NavigationBar() {
  const id = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const dispatch = useDispatch()

  const onLogout = useCallback(() => {
    dispatch(execLogout())
  }, [])

  const { t } = useTranslation()

  return (
    <nav className={styles.navbar + ' bg-opacity-50 bg-gray-500 dark:bg-gray-800  sticky top-0 py-4 w-full flex justify-around items-center z-30 shadow-lg'}>
      <div className='flex justify-around items-center'>
        <img
          src={require('../../assets/logo.png').default}
          alt="clippingkk logo"
          className='w-10 h-10 lg:w-20 lg:h-20 mr-2 lg:mr-12'
        />
        <ul className='flex'>
          {leftMenu.map((item, index) => (
            <li className='mr-3 lg:mr-6' key={index}>
              <Tooltip
                placement='bottom'
                overlay={<span>{t(`app.menu.${item.alt}`)}</span>}
              >
                <Link to={id === 0 ? '/auth/signin' :item.dest(id)}>
                  <span className='text-3xl lg:text-4xl'>
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
            <Link to={id === 0 ? '/auth/signin' : `/dash/${id}/settings`} className='text-3xl lg:text-4xl'>🛠</Link>
          </Tooltip>
        </li>
        <li className='mr-6' onClick={onLogout}>
          <Tooltip
            placement='bottom'
            overlay={<span>{t('app.menu.logout')}</span>}
          >
            <span className='text-3xl lg:text-4xl'>👋</span>
          </Tooltip>
        </li>
      </ul>
    </nav>
  )
}

export default NavigationBar
