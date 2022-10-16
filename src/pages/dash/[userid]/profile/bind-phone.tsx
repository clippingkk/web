import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import BindPhone from '../../../../components/bind-phone'
import Dialog from '../../../../components/dialog/dialog'
import bindPhoneMutation from '../../../../schema/mutations/bind-phone.graphql'
import { bindUserPhone, bindUserPhoneVariables } from '../../../../schema/mutations/__generated__/bindUserPhone'

type BindPhoneProps = {
}

function ProfileBindPhone(props: BindPhoneProps) {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [doAuth, doAuthResponse] = useMutation<bindUserPhone, bindUserPhoneVariables>(bindPhoneMutation)

  useEffect(() => {
    if (!doAuthResponse.called) {
      return
    }
    if (!doAuthResponse.loading) {
      return
    }
    if (!doAuthResponse.error) {
      return
    }

    doAuthResponse.client.resetStore()
    toast.success(t('app.profile.editor.phoneBinded'))
    setVisible(false)
  }, [doAuthResponse])


  return (
    <React.Fragment>
      <button
        className='text-2xl ml-4 p-2 transform transition-all hover:scale-110 duration-300 hover:bg-blue-400 hover:bg-opacity-50 focus:outline-none'
        onClick={() => setVisible(true)}
        title={t('app.profile.phoneBind')}
      > {t('app.profile.phoneBind')} </button>
      {visible && (
        <Dialog
          title={t('app.profile.editor.title')}
          onCancel={() => setVisible(false)}
          onOk={() => {
            () => setVisible(false)
          }}
        >
          <div className='w-full md:w-144 h-48 md:h-96 flex flex-col justify-center'>
            <BindPhone
              onFinalCheck={(pn, code) => doAuth({ variables: { phone: pn, code } })}
            />
          </div>
        </Dialog>
      )}
    </React.Fragment>
  )
}

export default ProfileBindPhone
