'use client'
import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { useMutation } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Library } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod/v4'

import { ExportDataToDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { ExportDestination } from '@/schema/generated'

import ExportTriggerButton from './export-trigger-button'

function ExportToObsidian({ email }: { email: string }) {
  const [visible, setVisible] = useState(false)
  const open = () => setVisible(true)
  const close = () => setVisible(false)
  const { t } = useTranslation(undefined, 'settings')

  const formSchema = z.object({
    endpoint: z.string().email(t('exports.errors.invalidEmail')).max(255),
  })

  type FormValues = z.infer<typeof formSchema>

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: email,
    },
  })

  const [mutate] = useMutation(ExportDataToDocument, {
    onCompleted() {
      toast.success(t('exports.queued'))
      reset()
      close()
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await mutate({
        variables: {
          destination: ExportDestination.Obsidian,
          args: data.endpoint,
        },
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch {
      // The mutation's onError already reports the failure.
    }
  }
  return (
    <>
      <ExportTriggerButton
        onClick={open}
        icon={<Library className="text-lake-accent-text" />}
        title={t('exports.obsidian')}
        description={t('exports.obsidianDescription')}
      />
      <Modal
        isOpen={visible}
        onClose={close}
        title={t('exports.obsidianTitle')}
      >
        <form className="w-full p-4" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-lake-fg-muted mb-4">{t('exports.obsidianTips')}</p>

          <div className="mb-4">
            <Controller
              name="endpoint"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="email"
                  label={t('exports.mailLabel')}
                  placeholder={t('exports.mailPlaceholder')}
                  error={errors.endpoint?.message}
                />
              )}
            />
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="submit" fullWidth loading={isSubmitting}>
              {t('exports.obsidianSubmit')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default ExportToObsidian
