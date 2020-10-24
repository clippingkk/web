import React, { useCallback, useEffect, useState } from 'react'
import Select from 'react-select'
import DarkModeToggle from "react-dark-mode-toggle"
import { useTranslation } from 'react-i18next'

type SettingsPageProps = {
}

const darkModeClassName = 'mode-dark'

function useDarkModeStatus() {
  const [is, setIs] = useState(false)
  useEffect(() => {
    const isDarkTheme = document.querySelector('html')?.classList.contains('mode-dark')
    setIs(isDarkTheme ?? false)
  }, [])
  const onDarkThemeChange = useCallback((v) => {
    const html = document.querySelector('html')
    if (html?.classList.contains(darkModeClassName)) {
      html?.classList.remove(darkModeClassName)
    } else {
      html?.classList.add(darkModeClassName)
    }
    setIs(v)
  }, [])

  return {
    isDarkTheme: is,
    onDarkThemeChange
  }
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
          <DarkModeToggle
            checked={isDarkTheme}
            onChange={onDarkThemeChange}
          />
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
      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4'>{t('app.settings.title')}</h3>
      <GlobalSettings />

    </div>
  )
}

export default SettingsPage
