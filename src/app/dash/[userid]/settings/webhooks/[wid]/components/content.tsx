import { useTranslation } from '@/i18n'
import { FetchWebhookQuery, WebHookStep } from '@/schema/generated'
import { Webhook } from 'lucide-react'
import WebhookDetailHeader from './header'
import RecordsList from './records-list'

interface WebhookDetailContentProps {
  data: FetchWebhookQuery['webHook']
  userId: string
}

async function WebhookDetailContent({
  data,
  userId,
}: WebhookDetailContentProps) {
  const { t } = await useTranslation(undefined, 'webhook')

  return (
    <div className="min-h-screen space-y-6 pb-10">
      <WebhookDetailHeader
        webhookId={data.id.toString()}
        userId={userId}
        url={data.hookUrl}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Webhook Info Card */}
        <div className="overflow-hidden rounded-xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-lg lg:col-span-1 dark:border-slate-700/20 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Webhook
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('app.settings.webhook.detail.infoTitle')}
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('app.settings.webhook.id')}
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {data.id}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('app.settings.webhook.step')}
              </p>
              <div className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {data.step === WebHookStep.OnCreateClippings
                  ? t('app.settings.webhook.onCreateClippings')
                  : data.step}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('app.settings.webhook.url')}
              </p>
              <p className="font-medium break-all text-gray-900 dark:text-white">
                {data.hookUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="overflow-hidden rounded-xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-lg lg:col-span-2 dark:border-slate-700/20 dark:bg-slate-800/50">
          <RecordsList
            records={data.records.records}
            totalCount={data.records.count}
          />
        </div>
      </div>
    </div>
  )
}

export default WebhookDetailContent
