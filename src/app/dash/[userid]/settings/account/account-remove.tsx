'use client'
import React, { useCallback, useState } from 'react'
import { useTranslation } from '@/i18n/client'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { USER_LOGOUT } from '@/store/user/type'
import { useRouter } from 'next/navigation'
import { Button, Modal } from '@mantine/core'
import { useDeleteMyAccountMutation } from '@/schema/generated'
import { notifications } from '@mantine/notifications'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
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
        icon: (<ExclamationCircleIcon className='w-4 h-4' />),
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
      <Button
        variant="gradient"
        gradient={{ from: 'orange', to: 'red' }}
        onClick={async () => {
          setConfirming(true)
        }}
      >
        {t('app.settings.danger.removeButton')}
      </Button>
      <Modal
        opened={confirming}
        centered
        size={'lg'}
        onClose={() => setConfirming(false)}
        title={t('app.settings.danger.removeAccount')}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 8,
        }}
      >
        <p className='text-center py-4 whitespace-break-spaces'>
          {t('app.settings.danger.removeAccountTip1')}
        </p>
        <Button
          variant="gradient"
          gradient={{ from: 'red', to: 'orange' }}
          className='mx-auto'
          fullWidth
          onClick={async () => {
            await onCleanServerCookie()
            await doDeleteMyAccount()
            setConfirming(false)
          }}
        >
          {t('app.settings.danger.removeButton')}
        </Button>
      </Modal>
    </>
  )
}

export default AccountRemoveButton
