import React from 'react'
import { useTranslation } from '@/i18n'
import SettingsSidebar from '@/components/settings-sidebar/settings-sidebar'

type SettingsPageProps = {
  children?: React.ReactNode
}

async function SettingsPageContent(props: SettingsPageProps) {
  const { children } = props
  const { t } = await useTranslation()
  return (
    <div className='flex container my-8 mx-auto overflow-hidden rounded-xl shadow-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80'>
      <SettingsSidebar 
        title={t('app.settings.title')}
      />
      
      {/* Main Content */}
      <div className='w-3/4 p-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm'>
        <div className='max-w-3xl mx-auto'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default SettingsPageContent
