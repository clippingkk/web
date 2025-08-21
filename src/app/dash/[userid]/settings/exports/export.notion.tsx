'use client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod/v4'
import BrandNotionLogo from '@/assets/brand-notion.svg'
import { useTranslation } from '@/i18n/client'
import { ExportDestination, useExportDataToMutation } from '@/schema/generated'

function ExportToNotion() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  const formSchema = z.object({
    notionToken: z
      .string()
      .min(
        5,
        t('app.settings.export.notion.tokenTooShort') ||
          'Token must be at least 5 characters'
      )
      .max(
        255,
        t('app.settings.export.notion.tokenTooLong') ||
          'Token must be at most 255 characters'
      ),
    notionPageId: z
      .string()
      .min(
        5,
        t('app.settings.export.notion.pageIdTooShort') ||
          'Page ID must be at least 5 characters'
      )
      .max(
        255,
        t('app.settings.export.notion.pageIdTooLong') ||
          'Page ID must be at most 255 characters'
      ),
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
      notionToken: '',
      notionPageId: '',
    },
  })

  const [mutate] = useExportDataToMutation({
    onCompleted() {
      toast.success(t('app.settings.export.success'))
      reset()
      setVisible(false)
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  const onSubmit = async (data: FormValues) => {
    await mutate({
      variables: {
        destination: ExportDestination.Notion,
        args: `${data.notionToken}|${data.notionPageId}`,
      },
    })
  }
  return (
    <>
      <button
        onClick={() => setVisible(true)}
        className='flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-4 transition-colors duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-800 dark:hover:bg-gray-700/80 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900'
      >
        <Image
          src={BrandNotionLogo}
          width={BrandNotionLogo.width / 1.5}
          height={BrandNotionLogo.height / 1.5}
          className='mb-3'
          alt='notion'
        />
        <span className='font-medium text-gray-800 dark:text-gray-200'>
          {t('app.settings.export.notion.title', 'Notion')}
        </span>
      </button>
      <Modal
        title={t('app.settings.export.notion.title')}
        isOpen={visible}
        onClose={() => setVisible(false)}
      >
        <div className='w-full p-4'>
          <iframe
            src='//player.bilibili.com/player.html?aid=503430935&bvid=BV1Tg411G7gG&cid=349347987&page=1'
            scrolling='no'
            allow='fullscreen'
            className='m-auto hidden max-h-96 w-144 border-0 lg:block'
            height='768px'
            width='1024px'
          />
          <form
            className='flex w-full flex-col items-center justify-center'
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name='notionToken'
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  label='Notion Token'
                  className='flex w-full items-center'
                  placeholder='Notion Token'
                />
              )}
            />
            <Controller
              name='notionPageId'
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  label='Notion Page ID'
                  className='mt-4 flex w-full items-center'
                  placeholder='Notion Page ID'
                />
              )}
            />
            <div className='mt-4 w-full text-right'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='rounded-lg bg-blue-600 px-5 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-95 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-900'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='mr-2 -ml-1 h-4 w-4 animate-spin text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    {t('app.common.loading', 'Loading...')}
                  </span>
                ) : (
                  t('app.settings.export.notion.submit')
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default ExportToNotion
