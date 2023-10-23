import { useMutation } from '@apollo/client'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { plainLogout } from '@/store/user/action'
import { USER_LOGOUT } from '@/store/user/type'
import { useRouter } from 'next/navigation'
import { Button } from '@mantine/core'
import { useDeleteMyAccountMutation } from '@/schema/generated'
import { notifications } from '@mantine/notifications'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

type AccountRemoveButtonProps = {
}

function AccountRemoveButton(props: AccountRemoveButtonProps) {
  const { t } = useTranslation()
  const [doDelete] = useDeleteMyAccountMutation()
  const { replace } = useRouter()

  const dispatch = useDispatch()

  const doDeleteMyAccount = useCallback(async () => {
    try {
      await doDelete()
      // do logout
      plainLogout()
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
    } catch (err: any) {
      console.error(err)
      toast.error(err)
    }
  }, [dispatch, doDelete, replace, t])

  return (
    <Button
      variant="gradient"
      gradient={{ from: 'orange', to: 'red' }}
      onClick={doDeleteMyAccount}
    >
      {t('app.settings.danger.removeButton')}
    </Button>
  )
}

export default AccountRemoveButton
