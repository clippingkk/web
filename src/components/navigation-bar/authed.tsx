import { Box, Divider, Tooltip } from '@mantine/core'
import Link from 'next/link'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UserContent } from '../../store/user/type';
import { Avatar, Button, HoverCard } from '@mantine/core';
import { CogIcon } from '@heroicons/react/24/solid';
import { ArrowLeftOnRectangleIcon, DevicePhoneMobileIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { CDN_DEFAULT_DOMAIN } from '../../constants/config';
import AvatarOnNavigationBar from './avatar';
import { useIsPremium } from '../../hooks/profile';
import { useProfileQuery } from '../../schema/generated';
import PremiumBadge from '../premium/badge';
import profile from '../../utils/profile';
import toast from 'react-hot-toast';
import mixpanel from 'mixpanel-browser';
import { onCleanServerCookie } from './logout';

type LoggedNavigationBarProps = {
  profile: UserContent
  uidOrDomain: string | number
  onPhoneLogin: () => void
  onSearch: () => void
}

function LoggedNavigationBar(props: LoggedNavigationBarProps) {
  const { uidOrDomain, onPhoneLogin, onSearch, profile: profileData } = props
  const { t } = useTranslation()

  const r = useRouter()

  const onLogout = useCallback(async () => {
    profile.onLogout()
    toast.success('Bye bye')
    mixpanel.track('logout')
    r.push('/')
  }, [])

  const isPremium = useIsPremium(profileData.premiumEndAt)

  const avatar = profileData.avatar.startsWith('http') ? profileData.avatar : `${CDN_DEFAULT_DOMAIN}/${profileData.avatar}`

  return (
    <ul className='flex with-slide-in'>
      <li className='mr-6'>
        <button
          onClick={onSearch}
          className=' bg-slate-500 bg-opacity-50 backdrop-blur hover:bg-opacity-100 transition-all duration-150 flex items-center px-4 py-2 rounded-full text-slate-800 dark:text-white'
        >
          <MagnifyingGlassIcon className='w-6 h-6 text-slate-100 dark:text-slate-300' />
          <span className='ml-2 text-slate-100 dark:text-slate-300'>{t('app.menu.search.title')}</span>
        </button>
      </li>
      <li className='mr-6'>
        <Tooltip
          label={<span>{t('app.menu.settings')}</span>}
        >
          <Link
            href={`/dash/${uidOrDomain}/settings/web`}
            className='text-3xl lg:text-4xl'
            title={t('app.menu.settings') ?? 'setting'}>
          </Link>
        </Tooltip>
      </li>
      <li>
        <HoverCard
          withArrow
          width={200}
          transitionProps={{
            transition: 'scale-y'
          }}
        >
          <HoverCard.Target>
            <Link href={`/dash/${uidOrDomain}/profile`}>
              <AvatarOnNavigationBar
                avatarUrl={avatar}
                isPremium={isPremium}
              />
            </Link>
          </HoverCard.Target>
          <HoverCard.Dropdown className='text-lg'>
            <Box>
              <Button
                fullWidth
                leftSection={(
                  <Avatar
                    size={24}
                    src={avatar}
                    radius={'xl'}
                  />
                )}
                className='flex items-center'
              >
                {profileData.name}
              </Button>
              <Button
                className='my-2'
                fullWidth
                leftSection={<DevicePhoneMobileIcon className='w-6 h-6' />}
                onClick={onPhoneLogin}
              >
                {t('app.menu.loginByQRCode.title')}
              </Button>
              <Button
                component={Link}
                href={`/dash/${uidOrDomain}/settings/web`}
                leftSection={<CogIcon className='w-6 h-6' />}
                fullWidth
              >
                {t('app.menu.settings')}
              </Button>

              <Divider my={12} />

              <Button
                color='red'
                fullWidth
                leftSection={<ArrowLeftOnRectangleIcon className='w-6 h-6' />}
                onClick={async () => {
                  await onCleanServerCookie()
                  onLogout()
                }}
              >
                {t('app.menu.logout')}
              </Button>
            </Box>

          </HoverCard.Dropdown>
        </HoverCard>
      </li>
    </ul>
  )
}

export default LoggedNavigationBar
