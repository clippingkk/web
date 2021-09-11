import React from 'react'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'
import SimpleSwitcher from './simple-switcher'
import Exports from './exports'
import WebHooks from './webhooks'
import { useDarkModeStatus } from '../../../../hooks/theme'
import DashboardContainer from '../../../../components/dashboard-container/container'

type SettingsPageProps = {
}

function GlobalSettings() {
  const { t, i18n } = useTranslation()
  const langOptions = Object.keys(i18n.store.data).map(x => ({ value: x, label: x }))
  const { isDarkTheme, onDarkThemeChange } = useDarkModeStatus()
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
          options={langOptions}
          className='w-64'
          value={langOptions.find(x => x.value === i18n.language)}
          onChange={(v: any) => {
            i18n.changeLanguage(v.value)
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
            checked={isDarkTheme}
            onChange={onDarkThemeChange}
          />
          {/* <DarkSwitcher
          checked={isDarkTheme}
          onChange={onDarkThemeChange}
          size={120}
           /> */}
          {/* <DarkModeSwitch
            style={{ marginBottom: '2rem' }}
            checked={isDarkTheme}
            onChange={onDarkThemeChange}
            size={120}
          /> */}
        </div>
      </div>
    </div>
  )
}

// dark mode
// i18n
function SettingsPage(props: SettingsPageProps) {
  const { t } = useTranslation()

  return (
    <div
      className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm bg-blue-800 bg-opacity-25`}
    >
      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4'> 🛠 {t('app.settings.title')}</h3>
      <GlobalSettings />

      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4 mt-8'>
        {t('app.settings.export.title')}
      </h3>
      <Exports />

      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4 mt-8'>
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
  )
}

SettingsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default SettingsPage
