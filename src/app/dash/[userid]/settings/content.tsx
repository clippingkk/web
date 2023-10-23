'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import SimpleSwitcher from './simple-switcher'
import Exports from './exports'
import WebHooks from './webhooks'
import AccountRemoveButton from './account-remove'
import { Select, useMantineColorScheme } from '@mantine/core'
import OrdersTable from './orders'

type SettingsPageProps = {
}

const langOptions = [{
  label: 'English',
  value: 'en'
}, {
  label: '简体中文',
  value: 'zh'
}, {
  label: '한국어',
  value: 'ko'
}]

function GlobalSettings() {
  const { t, i18n } = useTranslation()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  return (
    <div className='w-full'>
      <div className='w-full flex items-center justify-around mb-4'>
        <label
          htmlFor="lang"
          className='mr-4 text-black dark:text-white w-20 text-left'
        >
          Language:
        </label>
        <Select
          data={langOptions}
          className='w-64'
          value={langOptions.find(x => x.value === i18n.language)?.value}
          onChange={(v) => {
            i18n.changeLanguage(v!)
          }}
        />
      </div>

      <div className='w-full flex items-center justify-around mb-4'>
        <label
          htmlFor="lang"
          className='mr-4 text-black dark:text-white w-20 text-left'
        >
          {t('app.settings.theme')}:
        </label>

        <div className='w-64 text-right flex items-center justify-end'>
          <SimpleSwitcher
            checked={colorScheme === 'dark'}
            onChange={(v) => setColorScheme(v ? 'dark' : 'light')}
          />
        </div>
      </div>
    </div>
  )
}

// dark mode
// i18n
function SettingsPageContent(props: SettingsPageProps) {
  const { t } = useTranslation()
  return (
    <div
      className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm bg-blue-800 bg-opacity-25`}
    >
      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4'> 🛠 {t('app.settings.title')}</h3>
      <GlobalSettings />
      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4 mt-8'>
        {t('app.settings.orders.title')}
      </h3>
      <OrdersTable />

      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4 mt-8'>
        {t('app.settings.export.title')}
      </h3>
      <Exports />

      <div className='w-full'>
        <div className='mx-4 lg:mx-20'>
          <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4 mt-8 text-center'>
            {t('app.settings.webhook.title')}
            <a
              href="https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae"
              target='_blank'
              referrerPolicy='no-referrer'
              className='text-gray-800 dark:text-gray-200 text-sm ml-4 hover:underline' rel="noreferrer"
            >
              {t('app.settings.webhook.docLink')}
            </a>
          </h3>
          <WebHooks />
        </div>
      </div>

      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4 mt-8'>
        {t('app.settings.danger.removeAccount')}
      </h3>
      <AccountRemoveButton />
    </div>
  )
}

export default SettingsPageContent
