import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import BrandNotionLogo from '@/assets/brand-notion.svg'
import { useMutation } from '@apollo/client/react'
import { ExportDestination, ExportDataToDocument, type ExportDataToMutation } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

function ExportToEmail() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [mutate] = useMutation<ExportDataToMutation>(ExportDataToDocument)

  // Define validation schema with Zod
  const validationSchema = z.object({
    notionToken: z
      .string()
      .min(5, t('validation.min', { count: 5 }))
      .max(255, t('validation.max', { count: 255 })),
    notionPageId: z
      .string()
      .min(5, t('validation.min', { count: 5 }))
      .max(255, t('validation.max', { count: 255 })),
  })

  // Define form type
  type FormValues = z.infer<typeof validationSchema>

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      notionToken: '',
      notionPageId: '',
    },
  })

  const onSubmit = (values: FormValues) => {
    mutate({
      variables: {
        destination: ExportDestination.Notion,
        args: `${values.notionToken}|${values.notionPageId}`,
      },
    })
      .then(() => {
        toast.success(t('app.settings.export.success'))
        reset()
        setVisible(false)
      })
      .catch((e) => {
        toast.error(e.toString())
      })
  }
  return (
    <React.Fragment>
      <button
        type='button'
        className='rounded-md bg-gradient-to-br from-indigo-400 to-cyan-500 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
        onClick={() => setVisible(true)}
      >
        <Image
          src={BrandNotionLogo}
          width={BrandNotionLogo.width}
          height={BrandNotionLogo.height}
          className='px-4 py-4'
          alt='notion'
        />
      </button>
      <Modal
        isOpen={visible}
        onClose={() => setVisible(false)}
        title={t('app.settings.export.notion.title')}
      >
        <div className='w-full'>
          <iframe
            title='guide'
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
                <InputField {...field} name='notionToken' />
              )}
            />
            <Controller
              name='notionPageId'
              control={control}
              render={({ field }) => (
                <InputField {...field} name='notionPageId' />
              )}
            />
            <div className='w-full text-right'>
              <button
                type='submit'
                className='rounded-md bg-gradient-to-br from-indigo-400 to-cyan-500 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
              >
                {t('app.settings.export.notion.submit')}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ExportToEmail
