import { Download } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

import SettingsSectionLayout from '../components/SettingsSectionLayout'

async function SettingsExportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = await getTranslation()
  return (
    <SettingsSectionLayout
      icon={<Download className="h-8 w-8 text-amber-600 dark:text-amber-400" />}
      iconBgClass="bg-amber-100 dark:bg-amber-900/30"
      title={t('app.settings.exports.title', 'Export Clippings')}
      description={t(
        'app.settings.exports.description',
        'Export your clippings to different formats and platforms. Back up your data or integrate with other services.'
      )}
    >
      {children}
    </SettingsSectionLayout>
  )
}

export default SettingsExportsLayout
