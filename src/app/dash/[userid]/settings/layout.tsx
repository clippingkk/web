import type React from 'react'
import SettingsSidebar from '@/components/settings-sidebar/settings-sidebar'
import { getTranslation } from '@/i18n'

type SettingsPageProps = {
  children?: React.ReactNode
}

async function SettingsPageContent(props: SettingsPageProps) {
  const { children } = props
  const { t } = await getTranslation()
  return (
    <div className='flex container my-8 mx-auto overflow-hidden rounded-xl shadow-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80'>
      <SettingsSidebar title={t('app.settings.title')} />

      {/* Main Content */}
      <div className='w-full p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm min-h-128'>
        {children}
      </div>
    </div>
  )
}

export default SettingsPageContent
