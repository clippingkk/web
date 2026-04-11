import { Globe } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

import SettingsSectionLayout from '../components/SettingsSectionLayout'

async function SettingsWebLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getTranslation()
  return (
    <SettingsSectionLayout
      icon={<Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
      iconBgClass="bg-purple-100 dark:bg-purple-900/30"
      title={t('app.settings.web.title', 'Web Settings')}
      description={t(
        'app.settings.web.description',
        'Configure your website integration settings. Customize how your clippings appear on the web and control sharing options.'
      )}
    >
      {children}
    </SettingsSectionLayout>
  )
}

export default SettingsWebLayout
