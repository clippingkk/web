import { WebhookIcon } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

import SettingsSectionLayout from '../components/SettingsSectionLayout'

async function WebhooksLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getTranslation()
  return (
    <SettingsSectionLayout
      icon={
        <WebhookIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      }
      iconBgClass="bg-blue-100 dark:bg-blue-900/30"
      title={t('app.settings.webhooks.title', 'Webhooks')}
      description={t(
        'app.settings.webhooks.description',
        'Connect your clippings to external services. Webhooks allow you to receive notifications when new clippings are added to your account.'
      )}
    >
      {children}
    </SettingsSectionLayout>
  )
}

export default WebhooksLayout
