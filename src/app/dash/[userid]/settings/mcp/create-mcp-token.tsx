'use client'

import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import SegmentedControl from '@annatarhe/lake-ui/segmented-control'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

import { useTranslation } from '@/i18n/client'

import CopyBlock from './copy-block'

type Expiry = '30' | '90' | '365' | 'never'

function CreateMcpToken() {
  const { t } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [expiry, setExpiry] = useState<Expiry>('90')
  const [created, setCreated] = useState<string | null>(null)
  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t('mcp.create.nameRequired'))
          .max(64, t('mcp.create.nameTooLong')),
      }),
    [t]
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  const close = () => {
    reset()
    setExpiry('90')
    setOpen(false)
    // The plaintext exists only in this state; drop it with the dialog.
    if (created) {
      setCreated(null)
      router.refresh()
    }
  }

  const onSubmit = async ({ name }: z.infer<typeof schema>) => {
    try {
      const response = await fetch('/api/v3/tokens', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          ttlDays: expiry === 'never' ? null : Number(expiry),
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.msg || t('mcp.create.failed'))
      setCreated(payload.data.token)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('mcp.create.failed')
      )
    }
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        leadingIcon={<Plus className="size-4" />}
        onClick={() => setOpen(true)}
      >
        {t('mcp.tokens.new')}
      </Button>
      <Modal
        isOpen={open}
        onClose={close}
        title={created ? t('mcp.create.createdTitle') : t('mcp.create.title')}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            {created ? (
              <Button variant="primary" onClick={close}>
                {t('mcp.create.done')}
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={close}>
                  {t('mcp.tokens.cancel')}
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  form="create-mcp-token"
                  loading={isSubmitting}
                >
                  {t('mcp.create.submit')}
                </Button>
              </>
            )}
          </div>
        }
      >
        {created ? (
          <div className="flex flex-col gap-3">
            <p className="text-lake-fg-muted text-sm">
              {t('mcp.create.createdDescription')}
            </p>
            <CopyBlock value={created} />
          </div>
        ) : (
          <form
            id="create-mcp-token"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <InputField
              label={t('mcp.create.name')}
              placeholder={t('mcp.create.namePlaceholder')}
              maxLength={64}
              data-autofocus
              {...register('name')}
              error={errors.name?.message}
            />
            <div className="flex flex-col gap-1.5">
              <span className="type-meta">{t('mcp.create.expiry')}</span>
              <SegmentedControl<Expiry>
                aria-label={t('mcp.create.expiry')}
                value={expiry}
                onValueChange={setExpiry}
                options={[
                  { value: '30', label: t('mcp.create.expiry30') },
                  { value: '90', label: t('mcp.create.expiry90') },
                  { value: '365', label: t('mcp.create.expiry365') },
                  { value: 'never', label: t('mcp.create.expiryNever') },
                ]}
              />
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}

export default CreateMcpToken
