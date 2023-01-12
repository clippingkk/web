import { useMutation } from '@apollo/client'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import swal from 'sweetalert'
import { plainLogout } from '../../../../store/user/action'
import { USER_LOGOUT } from '../../../../store/user/type'
import { useRouter } from 'next/router'
import { Button } from '@mantine/core'
import { useDeleteMyAccountMutation } from '../../../../schema/generated'

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
      await swal({
        icon: 'info',
        title: t('app.settings.danger.removeAccountDone'),
        text: t('app.settings.danger.removeAccountDoneTip')
      })
      replace('/')
    } catch (err: any) {
      console.error(err)
      toast.error(err)
    }
  }, [dispatch, doDelete, replace, t])

  return (
    <Button
      variant="gradient"
      className='bg-gradient-to-br from-orange-400 to-red-500'
      onClick={doDeleteMyAccount}
    >
      {t('app.settings.danger.removeButton')}
    </Button>
  )
}

export default AccountRemoveButton
