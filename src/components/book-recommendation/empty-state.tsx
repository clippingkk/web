import { BookOpen } from 'lucide-react'

import { useTranslation } from '@/i18n/client'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <BookOpen className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400">
        {t('app.home.noRecommendations') ||
          'No recommendations available yet. Try again later.'}
      </p>
    </div>
  )
}
