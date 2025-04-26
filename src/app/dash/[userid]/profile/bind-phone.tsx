'use client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import BindPhone from '@/components/bind-phone'
import { useBindUserPhoneMutation } from '@/schema/generated'
import { Button } from '@mantine/core'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import Modal from '@annatarhe/lake-ui/modal'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

function ProfileBindPhone() {
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
        content={t('app.profile.phoneBind')}
      >
        <Button
          bg={'transparent'}
          onClick={() => setVisible(true)}
        >
          <DevicePhoneMobileIcon className='w-6 h-6' />
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        title={t('app.profile.editor.title')}
        onClose={() => setVisible(false)}
      >
        <div className='w-full md:w-144 h-48 md:h-96 flex flex-col justify-center'>
          <BindPhone
            onFinalCheck={(pn, code) => doAuth({ variables: { phone: pn, code } })}
          />
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ProfileBindPhone
