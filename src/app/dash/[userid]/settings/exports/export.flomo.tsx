'use client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod/v4'

import BrandFlomoLogo from '@/assets/brand-flomo.png'
import { Button } from '@/components/button/button'
import { useTranslation } from '@/i18n/client'
import { ExportDestination, useExportDataToMutation } from '@/schema/generated'

import ExportTriggerButton from './export-trigger-button'

function ExportToFlomo() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [mutate] = useExportDataToMutation()

  const formSchema = z.object({
    endpoint: z
      .string()
      .url(t('app.settings.export.flomo.invalidUrl') || 'Invalid URL')
      .max(255)
      .refine(
        (value) => value.startsWith('https://flomoapp.com/'),
        t('app.settings.export.flomo.notFlomo') ||
          'Must be a valid Flomo endpoint'
      ),
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
      endpoint: '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await mutate({
        variables: {
          destination: ExportDestination.Flomo,
          args: data.endpoint,
        },
      })
      toast.success(t('app.settings.export.success'))
      reset()
      setVisible(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'An error occurred')
    }
  }
  return (
    <>
      <ExportTriggerButton
        onClick={() => setVisible(true)}
        icon={
          <Image
            className="mb-3"
            src={BrandFlomoLogo}
            width={BrandFlomoLogo.width / 2.5}
            height={BrandFlomoLogo.height / 2.5}
            alt="flomo"
          />
        }
        label={t('app.settings.export.flomo.title', 'Flomo')}
      />
      <Modal
        isOpen={visible}
        onClose={() => setVisible(false)}
        title={t('app.settings.export.flomo.title')}
      >
        <div className="w-full p-4">
          <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="endpoint"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  className="flex w-full items-center"
                  placeholder="Flomo Endpoint"
                  error={errors.endpoint?.message}
                />
              )}
            />
            <div className="mt-4 w-full text-right">
              <Button type="submit" isLoading={isSubmitting}>
                {t('app.settings.export.flomo.submit')}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default ExportToFlomo
