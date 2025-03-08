import React from 'react'
import { useTranslation } from '@/i18n'
import AccountRemoveButton from './account-remove'

async function SettingsAccountPage() {
  const { t } = await useTranslation()
  return (
    <div className='w-full flex justify-center flex-col'>
      <h3 className='text-gray-800 dark:text-gray-200 text-2xl mb-4 mt-8 text-center'>
        {t('app.settings.danger.removeAccount')}
      </h3>
      <AccountRemoveButton />
    </div>
  )
}

export default SettingsAccountPage
