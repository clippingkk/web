// import { Tooltip } from '@mantine/core'
import Tooltip from '../tooltip/Tooltip';
import Link from 'next/link'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux';
import { UserContent, execLogout } from '../../store/user/type';
import { Avatar, Button, HoverCard, Menu } from '@mantine/core';
import { CogIcon } from '@heroicons/react/24/solid';
import { ArrowLeftOnRectangleIcon, DevicePhoneMobileIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { CDN_DEFAULT_DOMAIN } from '../../constants/config';
import AvatarOnNavigationBar from './avatar';
import { useIsPremium } from '../../hooks/profile';
import { useProfileQuery } from '../../schema/generated';
import PremiumBadge from '../premium/badge';

type LoggedNavigationBarProps = {
  profile: UserContent
  uidOrDomain: string | number
  onPhoneLogin: () => void
  onSearch: () => void
}

function LoggedNavigationBar(props: LoggedNavigationBarProps) {
  const { uidOrDomain, onPhoneLogin, onSearch, profile } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const r = useRouter()

  const onLogout = useCallback(() => {
    dispatch(execLogout(r.push))
  }, [])

  const { data: p } = useProfileQuery({
    variables: {
      id: profile.id,
    },
  })

  const isPremium = useIsPremium(p?.me.premiumEndAt)

  const avatar = profile.avatar.startsWith('http') ? profile.avatar : `${CDN_DEFAULT_DOMAIN}/${profile.avatar}`

  return (
    <ul className='flex with-slide-in'>
      <li className='mr-6'>
        <button
          onClick={onSearch}
          className=' bg-white bg-opacity-50 backdrop-blur hover:bg-opacity-100 transition-all duration-150 flex items-center px-4 py-2 rounded-full text-gray-800 dark:text-white'
        >
          <MagnifyingGlassIcon className='w-6 h-6' />
          <span className='ml-2'>{t('app.menu.search.title')}</span>
        </button>
      </li>
      <li className='mr-6'>
        <Tooltip
          placement='bottom'
          overlay={<span>{t('app.menu.settings')}</span>}
        >
          <Link
            href={`/dash/${uidOrDomain}/settings`}
            className='text-3xl lg:text-4xl'
            title={t('app.menu.settings') ?? 'setting'}>
          </Link>
        </Tooltip>
      </li>
      <li>
        <Menu
          trigger='hover'
          width={200}
          transitionProps={{
            transition: 'scale-y'
          }}
        >
          <Menu.Target>
            <Link href={`/dash/${uidOrDomain}/profile`}>
              <AvatarOnNavigationBar
                avatarUrl={avatar}
                isPremium={isPremium}
              />
            </Link>
          </Menu.Target>
          <Menu.Dropdown className='text-lg'>
            <Menu.Label
              className='text-lg'
            >
              {profile.name}
            </Menu.Label>
            <Menu.Item
              leftSection={(
                <Avatar
                  size={24}
                  src={avatar}
                  radius={'xl'}
                />
              )}
              className='flex items-center'
            >
              {profile.name}
            </Menu.Item>
            <Menu.Item
              leftSection={<DevicePhoneMobileIcon className='w-6 h-6' />}
              onClick={onPhoneLogin}
            >
              {t('app.menu.loginByQRCode.title')}
            </Menu.Item>
            <Menu.Item
              leftSection={<CogIcon className='w-6 h-6' />}
            >
              <Link href={`/dash/${uidOrDomain}/settings`}>
                {t('app.menu.settings')}
              </Link>
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              color='red'
              leftSection={<ArrowLeftOnRectangleIcon className='w-6 h-6' />}
              onClick={onLogout}
            >
              {t('app.menu.logout')}
            </Menu.Item>

          </Menu.Dropdown>
        </Menu>
      </li>
    </ul>
  )
}

export default LoggedNavigationBar
