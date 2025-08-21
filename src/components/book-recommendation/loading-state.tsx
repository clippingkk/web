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
      <Loader2 className='h-8 w-8 animate-spin text-blue-400 mb-4' />
      <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
        {t('app.home.aiThinking') ||
          'AI is thinking about your next great read...'}
      </p>
    </div>
  )
}
