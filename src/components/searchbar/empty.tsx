import { useTranslation } from '@/i18n/client'
import { SearchX } from 'lucide-react'

function Empty() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center py-16 flex-col">
      <div className="relative mb-6 p-4 rounded-full bg-slate-100 dark:bg-slate-800/50">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-md opacity-70" />
        <SearchX className="w-14 h-14 md:w-16 md:h-16 text-purple-500/60 dark:text-purple-400/60 relative z-10" />
      </div>
      <h3 className="text-xl font-medium text-slate-800 dark:text-white mb-2">{t('app.menu.search.empty')}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-xs">
        {t('app.menu.search.tryAgain') || 'Try different keywords or phrases'}
      </p>
    </div>
  )
}

export default Empty
