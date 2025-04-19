'use client'
import React, { useCallback, useState } from 'react'
import { useTranslation } from '@/i18n/client'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { USER_LOGOUT } from '@/store/user/type'
import { useRouter } from 'next/navigation'
import Modal from '@annatarhe/lake-ui/modal'
import { useDeleteMyAccountMutation } from '@/schema/generated'
import { notifications } from '@mantine/notifications'
import { AlertTriangle, AlertOctagon, Trash2 } from 'lucide-react'
import profile from '@/utils/profile'
import { onCleanServerCookie } from '@/components/navigation-bar/logout'

function AccountRemoveButton() {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const [doDelete] = useDeleteMyAccountMutation()
  const { replace } = useRouter()

  const dispatch = useDispatch()

  const doDeleteMyAccount = useCallback(async () => {
    try {
      await doDelete()
      // do logout
      profile.onLogout()
      toast.success('Bye bye')
      dispatch({ type: USER_LOGOUT })
      // show tips
      notifications.show({
        icon: (<AlertOctagon className='w-4 h-4' />),
        title: t('app.settings.danger.removeAccountDone'),
        message: t('app.settings.danger.removeAccountDoneTip'),
      })
      setTimeout(() => {
        replace('/')
      }, 5_000)
    } catch (err: unknown) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [dispatch, doDelete, replace, t])

  return (
    <>
      {/* Custom delete account button */}
      <button
        className="group relative overflow-hidden rounded-lg px-6 py-3 shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 active:scale-95"
        onClick={() => setConfirming(true)}
      >
        <span className="absolute inset-0 flex items-center justify-center w-full h-full bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out blur-md"></span>
        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        
        <span className="relative flex items-center justify-center gap-2 text-white font-medium">
          <Trash2 className="w-5 h-5" />
          {t('app.settings.danger.removeButton')}
        </span>
      </button>

      {/* Enhanced Modal */}
      <Modal
        title={(
          <div className="flex flex-row items-center gap-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertOctagon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('app.settings.danger.removeAccount')}
            </h3>
          </div>
        )}
        isOpen={confirming}
        onClose={() => setConfirming(false)}
      >
        <div className="p-6">
          {/* Custom modal header */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertOctagon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('app.settings.danger.removeAccount')}
            </h3>
          </div>
          
          {/* Warning message */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300 whitespace-break-spaces">
                {t('app.settings.danger.removeAccountTip1')}
              </p>
            </div>
          </div>
          
          {/* Custom confirm button */}
          <button
            className="w-full relative overflow-hidden rounded-lg px-6 py-4 shadow-lg transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 active:scale-95"
            onClick={async () => {
              await onCleanServerCookie()
              await doDeleteMyAccount()
              setConfirming(false)
            }}
          >
            <span className="absolute inset-0 w-full h-full bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center gap-2 text-white font-medium">
              <Trash2 className="w-5 h-5" />
              {t('app.settings.danger.removeButton')}
            </span>
          </button>
        </div>
      </Modal>
    </>
  )
}

export default AccountRemoveButton
