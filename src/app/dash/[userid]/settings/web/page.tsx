'use client'
import Cookies from 'js-cookie'
import { useMantineColorScheme } from '@mantine/core'
import React from 'react'
import { useTranslation } from '@/i18n/client'
import Select from '@annatarhe/lake-ui/form-select-field'
import Switch from '@annatarhe/lake-ui/form-switch-field'
import { STORAGE_LANG_KEY } from '@/constants/storage'
import { useRouter } from 'next/navigation'

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

function SettingsWebPage() {
  const { t, i18n } = useTranslation()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const r = useRouter()
  return (
    <div className='w-full'>
      <div className='w-full flex items-center justify-around mb-4'>
        <Select
          label='Language'
          options={langOptions}
          className='flex justify-between items-center w-full'
          value={langOptions.find(x => x.value === i18n.language)?.value}
          onChange={(e) => {
            const v = e.target.value

            Cookies.set(STORAGE_LANG_KEY, v!)
            i18n.changeLanguage(v!)
            r.refresh()
          }}
        />
      </div>
      <div className='w-full flex items-center justify-around mb-4'>
        <Switch
          label={t('app.settings.theme')}
          value={colorScheme === 'dark'}
          onChange={(v) => setColorScheme(v ? 'dark' : 'light')}
        />
      </div>
    </div>
  )
}

export default SettingsWebPage
