'use client'
import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { useMutation } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod/v4'

import { ExportDataToDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { ExportDestination } from '@/schema/generated'

import ExportTriggerButton from './export-trigger-button'

function ExportToMail({ email }: { email: string }) {
  const [visible, setVisible] = useState(false)
  const open = () => setVisible(true)
  const close = () => setVisible(false)
  const { t } = useTranslation()
  const { t: ts } = useTranslation(undefined, 'settings')

  const formSchema = z.object({
    endpoint: z
      .string()
      .email(
        t('app.settings.export.email.invalidEmail') || 'Invalid email address'
      )
      .max(255),
  })

  type FormValues = z.infer<typeof formSchema>

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: email,
    },
  })

  const [mutate] = useMutation(ExportDataToDocument, {
    onCompleted() {
      toast.success(t('app.settings.export.success'))
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
          destination: ExportDestination.Mail,
          args: data.endpoint,
        },
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (err) {
      // Error is already handled by the mutation's onError callback
      console.error(err)
    }
  }
  return (
    <>
      <ExportTriggerButton
        onClick={open}
        icon={<Mail className="text-lake-accent-text" />}
        title={ts('exports.mail')}
        description={ts('exports.mailDescription')}
      />
      <Modal
        isOpen={visible}
        onClose={close}
        title={t('app.settings.export.email.title')}
      >
        <form className="w-full p-4" onSubmit={handleSubmit(onSubmit)}>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t('app.settings.export.email.tips')}
          </p>

          <div className="mb-4">
            <Controller
              name="endpoint"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="email"
                  placeholder={t('app.settings.export.email.title')}
                />
              )}
            />
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="submit" fullWidth loading={isSubmitting}>
              {t('app.settings.export.email.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default ExportToMail
