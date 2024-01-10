'use client'
import { useMantineColorScheme, Select } from '@mantine/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import SimpleSwitcher from '../simple-switcher'

type SettingsWebPageProps = {
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

function SettingsWebPage(props: SettingsWebPageProps) {
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

export default SettingsWebPage
