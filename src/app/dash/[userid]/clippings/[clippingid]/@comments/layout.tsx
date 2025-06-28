
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
      <div className='w-full rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800 p-6 border-b border-gray-200 dark:border-zinc-800'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-400 dark:bg-blue-400 rounded-xl'>
              <MessageSquare className='h-5 w-5 text-white' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-zinc-50'>
              {t('app.clipping.comments.title')}
            </h3>
          </div>
        </div>
        
        <div className='p-6 space-y-6'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
