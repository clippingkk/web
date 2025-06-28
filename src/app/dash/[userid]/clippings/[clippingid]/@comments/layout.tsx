
import { useTranslation } from '@/i18n'
import { MessageSquare } from 'lucide-react'
import React from 'react'

type Props = {
  children: React.ReactNode
}

async function Layout(props: Props) {
  const { children } = props
  const { t } = await useTranslation()
  return (
    <div className='w-full mb-8'>
      <div className='relative w-full rounded-2xl overflow-hidden'>
        {/* Subtle texture overlay */}
        <div className='absolute inset-0 opacity-[0.015] dark:opacity-[0.02] pointer-events-none'>
          <svg width="100%" height="100%">
            <pattern id="comments-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" className='text-gray-900 dark:text-white' />
            </pattern>
            <rect width="100%" height="100%" fill="url(#comments-texture)" />
          </svg>
        </div>
        
        {/* Main container with gradient background */}
        <div className='relative bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-blue-900/10 border border-gray-200/80 dark:border-zinc-800/60 shadow-sm backdrop-blur-sm'>
          {/* Header with enhanced gradient */}
          <div className='relative bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 dark:from-zinc-800/90 dark:via-blue-900/20 dark:to-indigo-900/10 p-6 border-b border-gray-200/60 dark:border-zinc-800/50 backdrop-blur-sm'>
            {/* Subtle glow effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 dark:from-blue-400/10 dark:to-indigo-400/10' />
            
            <div className='relative flex items-center gap-3'>
              <div className='p-2 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-400 dark:to-blue-500 rounded-xl shadow-sm shadow-blue-400/20 dark:shadow-blue-400/20'>
                <MessageSquare className='h-5 w-5 text-white' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-zinc-50'>
                {t('app.clipping.comments.title')}
              </h3>
            </div>
          </div>
          
          <div className='relative p-6 space-y-6'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
