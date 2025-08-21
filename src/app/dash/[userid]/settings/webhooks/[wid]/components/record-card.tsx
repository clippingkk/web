'use client'

import { CheckCircle2, ChevronDown, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import type { WebHookRecord } from '@/schema/generated'
import dayjs from '@/utils/dayjs'

interface RecordCardProps {
  record: WebHookRecord
}

export default function RecordCard({ record }: RecordCardProps) {
  const { t } = useTranslation(undefined, 'webhook')
  const [isOpen, setIsOpen] = useState(false)

  const isSuccess = record.responseStatus >= 200 && record.responseStatus < 300
  const formattedDate = dayjs(record.startTime).fromNow()

  return (
    <div className='overflow-hidden rounded-lg border border-white/20 bg-white/50 shadow-md transition-all hover:shadow-lg dark:border-slate-700/20 dark:bg-slate-800/50'>
      <div
        className='flex cursor-pointer items-center justify-between p-4'
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex items-center gap-3'>
          {isSuccess ? (
            <CheckCircle2
              size={20}
              className='text-green-500 dark:text-green-400'
            />
          ) : (
            <XCircle size={20} className='text-red-500 dark:text-red-400' />
          )}
          <div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>#{record.id}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  isSuccess
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {record.responseStatus}
              </span>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {formattedDate}
            </p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform dark:text-gray-400 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className='border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-700/30 dark:bg-slate-900/30'>
          <h4 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            {t('app.settings.webhook.detail.content')}
          </h4>
          <div className='rounded-md bg-white p-3 font-mono text-sm text-gray-800 shadow-inner dark:bg-slate-800 dark:text-gray-300'>
            <pre className='break-words whitespace-pre-wrap'>
              {record.requestBody}
            </pre>
          </div>

          {record.errorMessage && (
            <div className='mt-3'>
              <h4 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                {t('app.settings.webhook.detail.statusMessage')}
              </h4>
              <div className='rounded-md bg-white p-3 font-mono text-sm text-gray-800 shadow-inner dark:bg-slate-800 dark:text-gray-300'>
                <pre className='break-words whitespace-pre-wrap'>
                  {record.errorMessage}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
