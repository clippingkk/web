'use client'
import BrandFlomoLogo from '@/assets/brand-flomo.png'
import { useTranslation } from '@/i18n/client'
import { ExportDestination, useExportDataToMutation } from '@/schema/generated'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod/v4'

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
      <button
        onClick={() => setVisible(true)}
        className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-4 transition-colors duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-800 dark:hover:bg-gray-700/80 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
      >
        <Image
          className="mb-3"
          src={BrandFlomoLogo}
          width={BrandFlomoLogo.width / 2.5}
          height={BrandFlomoLogo.height / 2.5}
          alt="flomo"
        />
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {t('app.settings.export.flomo.title', 'Flomo')}
        </span>
      </button>
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-95 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
              >
                {isSubmitting
                  ? t('app.common.loading', 'Loading...')
                  : t('app.settings.export.flomo.submit')}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default ExportToFlomo
