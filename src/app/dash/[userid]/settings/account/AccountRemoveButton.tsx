'use client'

import Button from '@annatarhe/lake-ui/button'
import ConfirmDialog from '@annatarhe/lake-ui/confirm-dialog'
import InputField from '@annatarhe/lake-ui/form-input-field'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'

type AccountRemoveButtonProps = {
  /** Typed back by the reader to confirm. */
  name: string
}

export default function AccountRemoveButton({
  name,
}: AccountRemoveButtonProps) {
  const { t } = useTranslation(undefined, 'settings')
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [scheduled, setScheduled] = useState('')
  // readers without a display name type a fixed word instead
  const phrase = name.trim() || t('account.confirmWord')

  async function remove() {
    let response: Response
    try {
      response = await fetch('/api/auth/delete-account', { method: 'POST' })
    } catch (error) {
      // offline or blocked: say so, and keep the dialog open to retry
      toast.error(t('account.failed'))
      throw error
    }
    const result = await response.json().catch(() => null)
    if (!response.ok) {
      toast.error(result?.msg || t('account.failed'))
      throw new Error(result?.msg || 'Deletion could not be scheduled')
    }
    setScheduled(result?.data?.message || t('account.scheduled'))
  }

  if (scheduled) {
    return (
      <output className="flex flex-col items-start gap-2 text-sm">
        <span className="text-lake-fg">{scheduled}</span>
        <a
          href="/"
          className="text-lake-accent-text font-medium hover:underline"
        >
          {t('account.home')}
        </a>
      </output>
    )
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        {t('account.deleteButton')}
      </Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => {
          setOpen(false)
          setTyped('')
        }}
        onConfirm={remove}
        tone="danger"
        title={t('account.confirmTitle')}
        description={t('account.confirmDescription', { name: phrase })}
        confirmLabel={t('account.confirm')}
        cancelLabel={t('account.cancel')}
        confirmDisabled={typed.trim() !== phrase}
      >
        <InputField
          label={
            name.trim()
              ? t('account.confirmLabel')
              : t('account.confirmWordLabel')
          }
          value={typed}
          autoComplete="off"
          onChange={(e) => setTyped(e.target.value)}
        />
      </ConfirmDialog>
    </>
  )
}
