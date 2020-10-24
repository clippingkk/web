import React from 'react'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

type SettingsPageProps = {
}

const themeOptions = [{
  value: 'dark',
  label: 'dark'
}, {
  value: 'light',
  label: 'light'
}]

function GlobalSettings() {
  const { t, i18n } = useTranslation()
  const langOptions = Object.keys(i18n.store.data).map(x => ({ value: x, label: x }))

  const isDarkTheme = document.querySelector('html')?.classList.contains('mode-dark')
  return (
    <div className='w-full'>
      <div className='w-full flex items-center justify-around mb-4'>
        <label
          htmlFor="lang"
          className='mr-4 text-black dark:text-white w-20'
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
          className='mr-4 text-black dark:text-white w-20'
        >
          Theme:
            </label>
        <Select
          options={themeOptions}
          className='w-64'
          value={isDarkTheme ? themeOptions[0] : themeOptions[1]}
          onChange={(v: any) => {
            console.log(v)
          }}
        />
      </div>
    </div>
  )
}

// dark mode
// i18n
function SettingsPage(props: SettingsPageProps) {

  return (
    <div
      className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm bg-blue-800 bg-opacity-25`}
    >
      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4'>Global Settings</h3>
      <GlobalSettings />

    </div>
  )
}

export default SettingsPage
