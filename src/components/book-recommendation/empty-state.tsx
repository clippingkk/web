import { BookOpen } from 'lucide-react'
import React from 'react'
import { useTranslation } from '@/i18n/client'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <p className="text-gray-500 dark:text-gray-400">
        {t('app.home.noRecommendations') ||
          'No recommendations available yet. Try again later.'}
      </p>
    </div>
  )
}
