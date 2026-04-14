import type React from 'react'

import SettingsSidebar from '@/components/settings-sidebar/settings-sidebar'
import Surface from '@/components/ui/surface/surface'
import { getTranslation } from '@/i18n'

type SettingsPageProps = {
  children?: React.ReactNode
}

async function SettingsPageContent(props: SettingsPageProps) {
  const { children } = props
  const { t } = await getTranslation()
  return (
    <Surface
      variant="default"
      className="my-6 flex w-full flex-col overflow-hidden p-0 md:flex-row"
    >
      <SettingsSidebar title={t('app.settings.title')} />
      <div className="min-h-[32rem] w-full flex-1 border-t border-slate-200/60 p-6 md:border-t-0 md:border-l md:p-8 dark:border-slate-800/60">
        {children}
      </div>
    </Surface>
  )
}

export default SettingsPageContent
