import { SearchX } from 'lucide-react'

import { useTranslation } from '@/i18n/client'

function Empty() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6 rounded-full bg-slate-100 p-4 dark:bg-slate-800/50">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-70 blur-md" />
        <SearchX className="relative z-10 h-14 w-14 text-purple-500/60 md:h-16 md:w-16 dark:text-purple-400/60" />
      </div>
      <h3 className="mb-2 text-xl font-medium text-slate-800 dark:text-white">
        {t('app.menu.search.empty')}
      </h3>
      <p className="max-w-xs text-center text-sm text-slate-600 dark:text-slate-400">
        {t('app.menu.search.tryAgain') || 'Try different keywords or phrases'}
      </p>
    </div>
  )
}

export default Empty
