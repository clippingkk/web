'use client'

import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { useMutation } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

import { CreateNewWebHookDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { WebHookStep } from '@/schema/generated'

function CreateWebhook() {
  const { t } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [createWebhook] = useMutation(CreateNewWebHookDocument)
  const schema = useMemo(
    () =>
      z.object({
        hookUrl: z
          .string()
          .trim()
          .url(t('webhooks.create.invalidUrl'))
          .max(255, t('webhooks.create.tooLong'))
          .refine(
            (v) => v.startsWith('https://'),
            t('webhooks.create.invalidUrl')
          ),
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
    defaultValues: { hookUrl: '' },
  })

  const close = () => {
    reset()
    setOpen(false)
  }

  const onSubmit = async ({ hookUrl }: z.infer<typeof schema>) => {
    try {
      await createWebhook({
        variables: { step: WebHookStep.OnCreateClippings, hookUrl },
      })
      toast.success(t('webhooks.create.created'))
      close()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('webhooks.create.failed')
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
        {t('webhooks.new')}
      </Button>
      <Modal
        isOpen={open}
        onClose={close}
        title={t('webhooks.create.title')}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              {t('webhooks.cancel')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="create-webhook"
              loading={isSubmitting}
            >
              {t('webhooks.create.submit')}
            </Button>
          </div>
        }
      >
        <form
          id="create-webhook"
          className="flex flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputField
            type="url"
            inputMode="url"
            label={t('webhooks.create.url')}
            placeholder="https://example.com/hooks/clippingkk"
            data-autofocus
            {...register('hookUrl')}
            error={errors.hookUrl?.message}
          />
          <p className="type-meta">{t('webhooks.create.urlHint')}</p>
        </form>
      </Modal>
    </>
  )
}

export default CreateWebhook
