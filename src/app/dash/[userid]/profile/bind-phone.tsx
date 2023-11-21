import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import BindPhone from '../../../../components/bind-phone'
import Dialog from '../../../../components/dialog/dialog'
import { useBindUserPhoneMutation } from '../../../../schema/generated'
import { Button, Tooltip } from '@mantine/core'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

type BindPhoneProps = {
}

function ProfileBindPhone(props: BindPhoneProps) {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [doAuth, doAuthResponse] = useBindUserPhoneMutation()

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
      <Tooltip
        label={t('app.profile.phoneBind')}
        withArrow
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <Button
          bg={'transparent'}
          onClick={() => setVisible(true)}
        >
          <DevicePhoneMobileIcon className='w-6 h-6' />
        </Button>
      </Tooltip>
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
