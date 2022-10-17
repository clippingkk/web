import { useMutation } from '@apollo/client'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import swal from 'sweetalert'
import mutationDeleteAccount from '../../../../schema/mutations/accountDelete.graphql'
import { plainLogout } from '../../../../store/user/action'
import { USER_LOGOUT } from '../../../../store/user/type'
import { useRouter } from 'next/router'

type AccountRemoveButtonProps = {
}

function AccountRemoveButton(props: AccountRemoveButtonProps) {
  const { t } = useTranslation()
  const [doDelete] = useMutation(mutationDeleteAccount)
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
  }, [dispatch, doDelete, t])

  return (
    <button className='bg-red-400 px-4 py-2' onClick={doDeleteMyAccount}>
      {t('app.settings.danger.removeButton')}
    </button>
  )
}

export default AccountRemoveButton
