import { Loader2 } from 'lucide-react'

import { useTranslation } from '@/i18n/client'

interface LoadingStateProps {
  isOverlay?: boolean
}

export function LoadingState({ isOverlay = false }: LoadingStateProps) {
  const { t } = useTranslation()

  const className = isOverlay
    ? 'absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-xs'
    : 'flex flex-col items-center justify-center text-center p-6'

  return (
    <div className={className}>
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-400" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {t('app.home.aiThinking') ||
          'AI is thinking about your next great read...'}
      </p>
    </div>
  )
}
