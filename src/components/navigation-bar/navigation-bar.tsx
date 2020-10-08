import React, { useCallback } from 'react'
import { Link } from '@reach/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect, useDispatch, useSelector } from 'react-redux'
import { execLogout } from '../../store/user/type';
import Tooltip from 'rc-tooltip'
import { TGlobalStore } from '../../store'
import { useTranslation } from 'react-i18next';
const styles = require('./navigation-bar.css')

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
    <nav className={styles.navbar + ' z-30'}>
      <div className={styles.menu}>
        <img
          src={require('../../assets/logo.png').default}
          alt="clippingkk logo"
          className={styles.logo}
        />
        <ul className='flex'>
          {leftMenu.map((item, index) => (
            <li className='mr-6' key={index}>
              <Tooltip
               placement='bottom'
               overlay={<span>{t(`app.menu.${item.alt}`)}</span>}
               >
                <Link to={item.dest(id)}>
                  <span className='text-4xl'>
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
            <span className='text-4xl'>🛠</span>
          </Tooltip>
        </li>
        <li className='mr-6' onClick={onLogout}>
          <Tooltip
            placement='bottom'
          overlay={<span>{t('app.menu.logout')}</span>}
          >
            <span className='text-4xl'>👋</span>
          </Tooltip>
        </li>
      </ul>
    </nav>
  )
}

export default NavigationBar
