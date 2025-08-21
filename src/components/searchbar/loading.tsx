import { useTranslation } from '@/i18n/client'

function Loading() {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      {/* Gradient spinner container */}
      <div className='relative mb-4'>
        {/* Blurred glow effect behind the spinner */}
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-lg opacity-70' />

        {/* Main spinner with gradient border */}
        <div className='relative'>
          <div className='w-12 h-12 rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-indigo-500/50 animate-spin' />
          <div className='absolute inset-0 w-12 h-12 rounded-full border-[3px] border-slate-200/20 dark:border-slate-700/20 animate-pulse' />
        </div>
      </div>

      {/* Loading text */}
      <p className='text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse'>
        {t('app.menu.search.searching') || 'Searching...'}
      </p>
    </div>
  )
}

export default Loading
