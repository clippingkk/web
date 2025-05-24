'use client'
import BindPhone from '@/components/bind-phone'
import Button from '@/components/button/button'
import { useTranslation } from '@/i18n/client'
import { useBindUserPhoneMutation } from '@/schema/generated'
import Modal from '@annatarhe/lake-ui/modal'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

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
      <Tooltip content={t('app.profile.phoneBind')}>
        <Button variant="ghost" onClick={() => setVisible(true)}>
          <DevicePhoneMobileIcon className="h-6 w-6" />
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        title={t('app.profile.editor.title')}
        onClose={() => setVisible(false)}
      >
        <div className="flex h-48 w-full flex-col justify-center md:h-96 md:w-144">
          <BindPhone
            onFinalCheck={(pn, code) =>
              doAuth({ variables: { phone: pn, code } })
            }
          />
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ProfileBindPhone
