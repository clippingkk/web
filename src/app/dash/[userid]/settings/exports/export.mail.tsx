'use client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { useSuspenseQuery } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod/v4'

import { Button } from '@/components/button/button'
import { useTranslation } from '@/i18n/client'
import {
  ExportDestination,
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
  useExportDataToMutation,
} from '@/schema/generated'

import ExportTriggerButton from './export-trigger-button'

function ExportToMail() {
  const [visible, setVisible] = useState(false)
  const open = () => setVisible(true)
  const close = () => setVisible(false)
  const { t } = useTranslation()

  const userDomain = useParams<{ userid: string }>().userid
  const isTypeUid = !Number.isNaN(parseInt(userDomain, 10))
  const { data: p } = useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(
    ProfileDocument,
    {
      variables: {
        id: isTypeUid ? ~~userDomain : undefined,
        domain: isTypeUid ? undefined : userDomain,
      },
    }
  )

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
      endpoint: p.me.email || '',
    },
  })

  const [mutate] = useExportDataToMutation({
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
        icon={
          <Mail className="mb-3 h-12 w-12 text-blue-600 dark:text-blue-400" />
        }
        label={t('app.settings.export.email.button', 'Email')}
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                />
              )}
            />
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              {t('app.settings.export.email.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default ExportToMail
