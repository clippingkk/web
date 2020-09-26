import React from 'react'
import { HideUntilLoaded } from '@nearform/react-animation'
import { UserContent } from '../../store/user/type'
import { publicData_public_users } from '../../schema/__generated__/publicData'

const styles = require('./tops.css')

type TopUsersProps = {
  users?: readonly publicData_public_users[]
}

function TopUsers(props: TopUsersProps) {
  if (!props.users) {
    return null
  }

  const users = props.users.map(x => ({
    ...x,
    avatar: x.avatar.startsWith('http') ? x.avatar : `https://clippingkk-cdn.annatarhe.com/${x.avatar}-copyrightDB`
  }))

  return (
    <div>
      <h2 className='text-3xl text-center font-bold my-8'>
        这些朋友爱读书
        <i className='text-sm text-gray-600 italic dark:text-gray-800'>由于隐私问题，并不展示用户书摘内容</i>
      </h2>
      <ul className='flex items-center justify-center flex-wrap'>
        {users.map(u => (
          <HideUntilLoaded
            imageToLoad={u.avatar}
            key={u.id}
          >
            <div className={'mx-4 flex flex-col justify-center items-center ' + styles['user-item']}>
              <img src={u.avatar} className='w-16 h-16 rounded-full transform hover:scale-110 duration-300 shadow-2xl object-contain' />
              <span className={'font-light block duration-300 opacity-0 mt-4 overflow-hidden ' + styles['user-name']}>{u.name}</span>
            </div>
          </HideUntilLoaded>
        ))}
      </ul>
    </div>
  )
}

export default TopUsers
