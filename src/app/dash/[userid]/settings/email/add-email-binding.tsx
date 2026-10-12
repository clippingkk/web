'use client'

import Button from '@annatarhe/lake-ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { useTranslation } from '@/i18n/client'

import EmailBindingDialog from './email-binding-dialog'

type AddEmailBindingProps = {
  max: number
  disabled?: boolean
}

function AddEmailBinding({ max, disabled }: AddEmailBindingProps) {
  const { t } = useTranslation(undefined, 'settings')
  const [open, setOpen] = useState(false)
  // A fresh dialog each time, so it starts at the address step.
  const [session, setSession] = useState(0)

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        leadingIcon={<Plus className="size-4" />}
        disabled={disabled}
        onClick={() => {
          setSession((value) => value + 1)
          setOpen(true)
        }}
      >
        {t('email.bindings.add')}
      </Button>
      <EmailBindingDialog
        key={session}
        isOpen={open}
        onClose={() => setOpen(false)}
        max={max}
      />
    </>
  )
}

export default AddEmailBinding
