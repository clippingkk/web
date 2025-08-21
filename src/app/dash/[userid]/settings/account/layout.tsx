import { AlertTriangle } from 'lucide-react'
import type React from 'react'
import { useTranslation } from '@/i18n'

async function SettingsAccountPage({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = await useTranslation()
  return (
    <div className='w-full max-w-4xl mx-auto'>
      {/* Top section with icon, title and description */}
      <div className='mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm'>
        <div className='flex flex-col items-center text-center'>
          <div className='p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4'>
            <AlertTriangle className='w-8 h-8 text-red-600 dark:text-red-400' />
          </div>

          <h2 className='text-gray-900 dark:text-gray-100 text-2xl font-bold mb-3'>
            {t('app.settings.danger.removeAccount')}
          </h2>

          <p className='text-gray-600 dark:text-gray-400 max-w-lg'>
            {t(
              'app.settings.danger.removeAccountDescription',
              'Warning: Account deletion is permanent. All your clippings and personal data will be removed from our servers.'
            )}
          </p>
        </div>
      </div>

      {/* Bottom content section */}
      <div className='bg-white dark:bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center'>
        {children}
      </div>
    </div>
  )
}

export default SettingsAccountPage
