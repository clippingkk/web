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
import { Button } from '@/components/button/button'
import { useTranslation } from '@/i18n/client'
import { ExportDestination, useExportDataToMutation } from '@/schema/generated'

import ExportTriggerButton from './export-trigger-button'

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
      <ExportTriggerButton
        onClick={() => setVisible(true)}
        icon={
          <Image
            src={BrandNotionLogo}
            width={BrandNotionLogo.width / 1.5}
            height={BrandNotionLogo.height / 1.5}
            className="mb-3"
            alt="notion"
          />
        }
        label={t('app.settings.export.notion.title', 'Notion')}
      />
      <Modal
        title={t('app.settings.export.notion.title')}
        isOpen={visible}
        onClose={() => setVisible(false)}
      >
        <div className="w-full p-4">
          <iframe
            title="guide"
            src="//player.bilibili.com/player.html?aid=503430935&bvid=BV1Tg411G7gG&cid=349347987&page=1"
            sandbox="allow-scripts allow-popups"
            scrolling="no"
            allow="fullscreen"
            className="m-auto hidden max-h-96 w-144 border-0 lg:block"
            height="768px"
            width="1024px"
          />
          <form
            className="flex w-full flex-col items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="notionToken"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  label="Notion Token"
                  className="flex w-full items-center"
                  placeholder="Notion Token"
                />
              )}
            />
            <Controller
              name="notionPageId"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  label="Notion Page ID"
                  className="mt-4 flex w-full items-center"
                  placeholder="Notion Page ID"
                />
              )}
            />
            <div className="mt-4 w-full text-right">
              <Button type="submit" isLoading={isSubmitting}>
                {t('app.settings.export.notion.submit')}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default ExportToNotion
