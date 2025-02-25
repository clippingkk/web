'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import { Cog8ToothIcon, DocumentArrowDownIcon, GlobeAltIcon, QueueListIcon, UserIcon } from '@heroicons/react/24/outline'

type SettingsPageProps = {
  children?: React.ReactNode
}

function SettingsPageContent(props: SettingsPageProps) {
  const { children } = props
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const paths = pathname?.split('/')
  const activeKey = paths.pop()

  return (
    <div
      className={'flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-xs bg-slate-200 dark:bg-slate-800 bg-opacity-70'}
    >
      <Tabs value={activeKey} onChange={(v) => router.push(`${paths.join('/')}/${v}`)} className='w-10/12'>
        <Tabs.List>
          <Tabs.Tab
            leftSection={<Cog8ToothIcon className='w-4 h-4' />}
            value='web'
          >
            {t('app.settings.title')}
          </Tabs.Tab>
          <Tabs.Tab
            leftSection={<QueueListIcon className='w-4 h-4' />}
            value='orders'
          >{t('app.settings.orders.title')}</Tabs.Tab>
          <Tabs.Tab
            leftSection={<GlobeAltIcon className='w-4 h-4' />}
            value='webhooks'
          >{t('app.settings.webhook.title')}</Tabs.Tab>
          <Tabs.Tab
            leftSection={<DocumentArrowDownIcon className='w-4 h-4' />}
            value='exports'>{t('app.settings.export.title')}</Tabs.Tab>
          <Tabs.Tab
            ml='auto'
            leftSection={<UserIcon className='w-4 h-4' />}
            value='account'
          >
            Account
          </Tabs.Tab>
        </Tabs.List>
        {
          ['web', 'orders', 'webhooks', 'exports', 'account']
            .map((tab) => (
              <Tabs.Panel
                key={tab}
                value={tab}
              >
                <div className='pt-10'>
                  {children}
                </div>
              </Tabs.Panel>
            ))
        }
      </Tabs>
    </div>
  )
}

export default SettingsPageContent
