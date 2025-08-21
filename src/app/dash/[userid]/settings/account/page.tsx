'use client'
import Modal from '@annatarhe/lake-ui/modal'
import { AlertOctagon, AlertTriangle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { onCleanServerCookie } from '@/components/navigation-bar/logout'
import { useTranslation } from '@/i18n/client'
import { useDeleteMyAccountMutation } from '@/schema/generated'
import profile from '@/utils/profile'

function AccountRemoveButton() {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const [doDelete] = useDeleteMyAccountMutation()
  const { replace } = useRouter()

  const doDeleteMyAccount = useCallback(async () => {
    try {
      await doDelete()
      // do logout
      profile.onLogout()
      toast.success('Bye bye')
      // show tips
      toast(t('app.settings.danger.removeAccountDone'), {
        icon: <AlertOctagon className='h-4 w-4' />,
        // message: t('app.settings.danger.removeAccountDoneTip'),
      })
      setTimeout(() => {
        replace('/')
      }, 5_000)
    } catch (err: unknown) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [doDelete, replace, t])

  return (
    <>
      {/* Custom delete account button */}
      <button
        className='group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 shadow-lg transition-all duration-300 hover:from-red-600 hover:to-orange-600 hover:shadow-xl focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none active:scale-95 dark:focus:ring-offset-gray-900'
        onClick={() => setConfirming(true)}
      >
        <span className='absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-r from-red-600 to-orange-600 opacity-0 blur-md transition-opacity duration-300 ease-in-out group-hover:opacity-100'></span>
        <span className='absolute top-0 left-0 h-full w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></span>

        <span className='relative flex items-center justify-center gap-2 font-medium text-white'>
          <Trash2 className='h-5 w-5' />
          {t('app.settings.danger.removeButton')}
        </span>
      </button>

      {/* Enhanced Modal */}
      <Modal
        title={
          <div className='flex flex-row items-center gap-4'>
            <div className='rounded-full bg-red-100 dark:bg-red-900/30'>
              <AlertOctagon className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
              {t('app.settings.danger.removeAccount')}
            </h3>
          </div>
        }
        isOpen={confirming}
        onClose={() => setConfirming(false)}
      >
        <div className='p-6'>
          {/* Custom modal header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30'>
              <AlertOctagon className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
              {t('app.settings.danger.removeAccount')}
            </h3>
          </div>

          {/* Warning message */}
          <div className='mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500' />
              <p className='whitespace-break-spaces text-gray-700 dark:text-gray-300'>
                {t('app.settings.danger.removeAccountTip1')}
              </p>
            </div>
          </div>

          {/* Custom confirm button */}
          <button
            className='relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 shadow-lg transition-all duration-300 hover:from-red-700 hover:to-orange-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none active:scale-95 dark:focus:ring-offset-gray-900'
            onClick={async () => {
              await onCleanServerCookie()
              await doDeleteMyAccount()
              setConfirming(false)
            }}
          >
            <span className='absolute inset-0 h-full w-full bg-black opacity-0 transition-opacity duration-300 hover:opacity-10'></span>
            <span className='relative flex items-center justify-center gap-2 font-medium text-white'>
              <Trash2 className='h-5 w-5' />
              {t('app.settings.danger.removeButton')}
            </span>
          </button>
        </div>
      </Modal>
    </>
  )
}

export default AccountRemoveButton
