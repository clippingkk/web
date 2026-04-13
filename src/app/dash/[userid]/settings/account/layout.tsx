import { AlertTriangle } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

import SettingsSectionLayout from '../components/SettingsSectionLayout'

async function SettingsAccountPage({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = await getTranslation()
  return (
    <SettingsSectionLayout
      icon={
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      }
      iconBgClass="bg-red-100 dark:bg-red-900/30"
      title={t('app.settings.danger.removeAccount')}
      description={t(
        'app.settings.danger.removeAccountDescription',
        'Warning: Account deletion is permanent. All your clippings and personal data will be removed from our servers.'
      )}
    >
      {children}
    </SettingsSectionLayout>
  )
}

export default SettingsAccountPage
