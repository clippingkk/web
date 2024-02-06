'use client';
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'
import HideUntilLoaded from '../SimpleAnimation/HideUntilLoaded'
import styles from './tops.module.css'
import { User } from '../../schema/generated'

type TopUsersProps = {
  users?: Pick<User, 'id' | 'avatar' | 'name'>[]
}

function TopUsers(props: TopUsersProps) {
  const { t } = useTranslation()
  if (!props.users) {
    return null
  }
  const users = props
    .users
    .filter(x => x.avatar && x.avatar !== 'null')
    .map(x => ({
      ...x,
      avatar: x.avatar.startsWith('http') ? x.avatar : `${CDN_DEFAULT_DOMAIN}/${x.avatar}`
    }))
  return (
    <div>
      <div className='flex flex-col justify-center mb-8'>
        <h2 className='text-3xl text-center font-bold mt-8 mb-2 dark:text-gray-200 text-slate-900'>
          {t('app.public.readers')}
        </h2>
        <i className='text-sm text-center text-gray-600 italic ml-2 dark:text-gray-200'>{t('app.public.hideReasons')}</i>
      </div>
      <ul className='flex items-center justify-center flex-wrap'>
        {users.map(u => (
          <HideUntilLoaded
            imageToLoad={u.avatar}
            key={u.id}
          >
            <div className={'mx-4 flex flex-col justify-center items-center with-slide-in ' + styles['user-item']}>
              <img
                src={u.avatar}
                className='w-16 h-16 rounded-full transform hover:scale-110 duration-300 shadow-2xl object-cover'
                alt={u.name}
              />
              <span className={'font-light block duration-300 opacity-0 mt-4 overflow-hidden dark:text-gray-200 text-slate-800 ' + styles['user-name']}>{u.name}</span>
            </div>
          </HideUntilLoaded>
        ))}
      </ul>
    </div>
  )
}

export default TopUsers
