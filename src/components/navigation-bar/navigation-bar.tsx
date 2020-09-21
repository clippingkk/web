import React, { useCallback } from 'react'
import { Link } from '@reach/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect, useDispatch, useSelector } from 'react-redux'
import { execLogout } from '../../store/user/type';
import Tooltip from 'rc-tooltip'
import { TGlobalStore } from '../../store'
const styles = require('./navigation-bar.css')

const leftMenu = [
  {
    emoji: '📙',
    alt: '我的已读',
    dest: (id: number) => `/dash/${id}/home`,
  },
  {
    emoji: '🎪',
    alt: '广场',
    dest: (id: number) => `/dash/${id}/square`,
  },
  {
    emoji: '🎈',
    alt: '上传',
    dest: (id: number) => `/dash/${id}/upload`,
  },
  {
    emoji: '👼',
    alt: '我的信息',
    dest: (id: number) => `/dash/${id}/profile`,
  },
]

function NavigationBar() {
  const id = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const dispatch = useDispatch()

  const onLogout = useCallback(() => {
    dispatch(execLogout())
  }, [])

  return (
      <nav className={styles.navbar}>
        <div className={styles.menu}>
          <img
            src={require('../../assets/logo.png').default}
            alt="clippingkk logo"
            className={styles.logo}
          />
          <ul className='flex'>
            {leftMenu.map((item, index) => (
              <li className='mr-6' key={index}>
                <Tooltip placement='bottom' overlay={<span>{item.alt}</span>}>
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
            <Tooltip placement='bottom' overlay={<span>设置</span>}>
              <span className='text-4xl'>🛠</span>
            </Tooltip>
          </li>
          <li className='mr-6' onClick={onLogout}>
            <Tooltip placement='bottom' overlay={<span>退出</span>}>
              <span className='text-4xl'>👋</span>
            </Tooltip>
          </li>
        </ul>
      </nav>
  )
}

export default NavigationBar
