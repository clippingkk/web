import { ArrowLeft, ExternalLink, Webhook } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/i18n'

interface HeaderProps {
  webhookId: string
  userId: string
  url: string
}

async function WebhookDetailHeader({ webhookId, userId, url }: HeaderProps) {
  const { t } = await useTranslation(undefined, 'webhook')

  return (
    <div className='mb-8'>
      <Link
        href={`/dash/${userId}/settings/webhooks`}
        className='mb-4 flex items-center gap-2 text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300'
      >
        <ArrowLeft size={16} />
        <span className='text-sm font-medium'>{t('app.common.back')}</span>
      </Link>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
            <Webhook
              size={24}
              className='text-indigo-600 dark:text-indigo-400'
            />
          </div>
          <div>
            <h1 className='bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent'>
              {t('app.settings.webhook.detail.title')} #{webhookId}
            </h1>
            <p className='mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <span className='max-w-md truncate'>{url}</span>
              <a
                href={url}
                target='_blank'
                rel='noreferrer noopener'
                className='inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300'
              >
                <ExternalLink size={12} />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebhookDetailHeader
