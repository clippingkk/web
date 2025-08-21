'use client'
import Modal from '@annatarhe/lake-ui/modal'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/button'
import { useTranslation } from '@/i18n/client'
import WebHookCreate from './create'

type Props = {
  isPremium: boolean
}

function WebhookCreateButton({ isPremium }: Props) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Tooltip
        disabled={isPremium}
        content={!isPremium ? t('app.payment.webhookRequired') : null}
      >
        <Button
          disabled={!isPremium}
          onClick={() => setVisible(true)}
          className='px-6 py-2.5 shadow-lg hover:shadow-xl'
        >
          <PlusIcon size={18} className='mr-2' />
          <span>New</span>
        </Button>
      </Tooltip>
      <Modal
        isOpen={visible}
        onClose={() => setVisible(false)}
        title={t('app.settings.webhook.title')}
      >
        <WebHookCreate
          onClose={() => setVisible(false)}
          isPremium={isPremium}
        />
      </Modal>
    </>
  )
}

export default WebhookCreateButton
