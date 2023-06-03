// import { Tooltip } from '@mantine/core'
import Tooltip from '../tooltip/Tooltip';
import Link from 'next/link'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux';
import { UserContent, execLogout } from '../../store/user/type';
import { Avatar, HoverCard, Menu } from '@mantine/core';
import { CogIcon } from '@heroicons/react/24/solid';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

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

  return (
    <ul className='flex'>
      <li className='mr-6'>
        <Tooltip
          placement='bottom'
          overlay={<span>{t('app.menu.loginByQRCode.title')}</span>}
        >
          <button
            className='text-3xl lg:text-4xl'
            title={t('app.menu.loginByQRCode.title') ?? ''}
            onClick={onPhoneLogin}
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
            onClick={onSearch}
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
              <Avatar
                src={profile.avatar}
                radius={'xl'}
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
              icon={(
                <Avatar
                size={24}
                  src={profile.avatar}
                  radius={'xl'}
                />
              )}
            >
              {profile.name}
            </Menu.Item>
            <Menu.Item
              icon={<CogIcon className='w-6 h-6' />}
            >
              <Link href={`/dash/${uidOrDomain}/settings`}>
                {t('app.menu.settings')}
              </Link>
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              color='red'
              icon={<ArrowLeftOnRectangleIcon className='w-6 h-6' />}
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
