'use client'

import { useTranslation } from '@/i18n/client'
import { FetchWebhookQuery } from '@/schema/generated'
import { History } from 'lucide-react'
import { useState } from 'react'
import RecordCard from './record-card'

interface RecordsListProps {
  records: FetchWebhookQuery['webHook']['records']['records']
  totalCount: number
}

export default function RecordsList({ records, totalCount }: RecordsListProps) {
  const { t } = useTranslation(undefined, 'webhook')
  const [displayCount, setDisplayCount] = useState(10)

  const visibleRecords = records.slice(0, displayCount)
  const hasMoreRecords = records.length > displayCount

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <History size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('app.settings.webhook.detail.recordsTitle')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('app.settings.webhook.detail.recordsCount', {
              count: totalCount,
            })}
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-slate-800/30">
          <p className="text-gray-500 dark:text-gray-400">
            {t('app.settings.webhook.detail.noRecords')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleRecords.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}

          {hasMoreRecords && (
            <button
              onClick={() => setDisplayCount((prev) => prev + 10)}
              className="mt-4 w-full rounded-lg border border-indigo-200 bg-indigo-50 py-3 font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
            >
              {t('app.settings.webhook.detail.loadMore')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
