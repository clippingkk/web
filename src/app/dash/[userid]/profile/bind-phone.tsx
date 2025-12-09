'use client'
import Modal from '@annatarhe/lake-ui/modal'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import React, { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import BindPhone from '@/components/bind-phone'
import Button from '@/components/button/button'
import { useTranslation } from '@/i18n/client'
import { useBindUserPhoneMutation } from '@/schema/generated'

function ProfileBindPhone() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  const [doAuth] = useBindUserPhoneMutation({
    onCompleted: (_, clientOptions) => {
      clientOptions?.client?.resetStore()
      toast.success(t('app.profile.editor.phoneBinded'))
      setVisible(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handlePhoneBind = useCallback(
    (pn: string, code: string) => {
      return doAuth({ variables: { phone: pn, code } })
    },
    [doAuth]
  )

  return (
    <React.Fragment>
      <Tooltip content={t('app.profile.phoneBind')}>
        <Button variant='ghost' onClick={() => setVisible(true)}>
          <DevicePhoneMobileIcon className='h-6 w-6' />
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        title={t('app.profile.editor.title')}
        onClose={() => setVisible(false)}
      >
        <div className='flex h-48 w-full flex-col justify-center md:h-96 md:w-144'>
          <BindPhone onFinalCheck={handlePhoneBind} />
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ProfileBindPhone
