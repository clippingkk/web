import React from 'react'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

type SettingsPageProps = {
}

// dark mode
// i18n
function SettingsPage(props: SettingsPageProps) {
  const { t, i18n } = useTranslation()
  console.log(i18n)
  const langOptions = Object.keys(i18n.store.data).map(x => ({ value: x, label: x }))

  return (
    <div>
      <div
        className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm bg-blue-800 bg-opacity-25`}
      >
        <div className='flex items-center justify-center'>
          <label htmlFor="lang" className='mr-4'>language</label>
          <Select
            options={langOptions}
            className='w-32'
            value={langOptions.find(x => x.value === i18n.language)}
            onChange={(v:any) => {
              i18n.changeLanguage(v.value)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
