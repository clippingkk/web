import { WebhookIcon } from 'lucide-react'
import type React from 'react'

import { getTranslation } from '@/i18n'

async function WebhooksLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getTranslation()
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Top section with icon, title and description */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <WebhookIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('app.settings.webhooks.title', 'Webhooks')}
          </h2>

          <p className="max-w-lg text-gray-600 dark:text-gray-400">
            {t(
              'app.settings.webhooks.description',
              'Connect your clippings to external services. Webhooks allow you to receive notifications when new clippings are added to your account.'
            )}
          </p>
        </div>
      </div>

      {/* Bottom content section */}
      <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
        {children}
      </div>
    </div>
  )
}

export default WebhooksLayout
