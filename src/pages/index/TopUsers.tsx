import React from 'react'
import { publicData_public_users } from '../../schema/__generated__/publicData'
import { useTranslation } from 'react-i18next'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'
import HideUntilLoaded from '../../components/SimpleAnimation/HideUntilLoaded'
import styles from './tops.module.css'

type TopUsersProps = {
  users?: readonly publicData_public_users[]
}

function TopUsers(props: TopUsersProps) {
  const { t } = useTranslation()
  if (!props.users) {
    return null
  }
  const users = props
  .users
  .filter(x => x.avatar !== 'null')
  .map(x => ({
    ...x,
    avatar: x.avatar.startsWith('http') ? x.avatar : `${CDN_DEFAULT_DOMAIN}/${x.avatar}`
  }))
  return (
    <div>
      <h2 className='text-3xl text-center font-bold my-8 dark:text-gray-200'>
        {t('app.public.readers')}
        <i className='text-sm text-gray-600 italic ml-2 dark:text-gray-200'>{t('app.public.hideReasons')}</i>
      </h2>
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
              />
              <span className={'font-light block duration-300 opacity-0 mt-4 overflow-hidden dark:text-gray-200 ' + styles['user-name']}>{u.name}</span>
            </div>
          </HideUntilLoaded>
        ))}
      </ul>
    </div>
  )
}

export default TopUsers
