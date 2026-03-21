import { useTranslation } from '@/i18n/client'

function Loading() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Gradient spinner container */}
      <div className="relative mb-4">
        {/* Blurred glow effect behind the spinner */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-70 blur-lg" />

        {/* Main spinner with gradient border */}
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-indigo-500/50" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full border-[3px] border-slate-200/20 dark:border-slate-700/20" />
        </div>
      </div>

      {/* Loading text */}
      <p className="animate-pulse text-sm font-medium text-slate-600 dark:text-slate-400">
        {t('app.menu.search.searching') || 'Searching...'}
      </p>
    </div>
  )
}

export default Loading
