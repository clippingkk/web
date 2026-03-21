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
    <div className="bg-opacity-80 dark:bg-opacity-80 container mx-auto my-8 flex overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 shadow-2xl backdrop-blur-sm dark:from-slate-800 dark:to-slate-900">
      <SettingsSidebar title={t('app.settings.title')} />

      {/* Main Content */}
      <div className="min-h-128 w-full bg-white/50 p-8 backdrop-blur-sm dark:bg-slate-800/50">
        {children}
      </div>
    </div>
  )
}

export default SettingsPageContent
