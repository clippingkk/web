'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { TGlobalStore } from '@/store'
import { useFormik } from 'formik'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button, Tooltip, Modal, TextInput } from '@mantine/core'
import { FetchMyWebHooksQuery, useCreateNewWebHookMutation, useDeleteAWebHookMutation, useFetchMyWebHooksQuery, useProfileQuery, WebHookStep } from '@/schema/generated'
import { useIsPremium } from '@/hooks/profile'
import WebhookTable from '../components/webhook-table'

const webhookColumns: ColumnDef<FetchMyWebHooksQuery['me']['webhooks'][0]>[] = [{
  header: 'id',
  accessorKey: 'id'
}, {
  header: 'step',
  accessorKey: 'step'
}, {
  header: 'url',
  accessorKey: 'hookUrl'
}, {
  header: 'action',
}]

function WebHooks() {
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)

  const { data: me } = useProfileQuery({
    variables: {
      id: uid
    },
    skip: uid <= 0
  })

  const isPremium = useIsPremium(me?.me.premiumEndAt)

  const { data: webhooksResp, client, refetch } = useFetchMyWebHooksQuery({
    variables: {
      id: uid
    },
    skip: uid <= 0
  })

  const { t } = useTranslation()

  const [createMutation] = useCreateNewWebHookMutation()
  const [deleteMutation] = useDeleteAWebHookMutation({
    onCompleted: () => {
      refetch()
      toast.success(t('app.common.done'))
    }
  })

  const [visible, setVisible] = useState(false)
  const formik = useFormik({
    initialValues: {
      hookUrl: '',
    },
    validationSchema: Yup.object({
      hookUrl: Yup.string().url().max(255),
    }),
    async onSubmit(vals) {
      if (vals.hookUrl.length <= 3 || !formik.isValid) {
        return
      }
      return createMutation({
        variables: {
          step: WebHookStep.OnCreateClippings,
          hookUrl: vals.hookUrl
        }
      }).then(() => {
        toast.success(t('app.common.done'))
        formik.resetForm()
        client.resetStore()
        refetch()
        setVisible(false)
      })
    }
  })

  const table = useReactTable({
    columns: webhookColumns,
    getCoreRowModel: getCoreRowModel(),
    data: webhooksResp?.me.webhooks ?? []
  })

  return (
    <div className='w-full text-center'>
      <a
        href="https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae"
        target='_blank'
        referrerPolicy='no-referrer'
        className='text-gray-800 dark:text-gray-200 text-sm hover:underline' rel="noreferrer"
      >
        {t('app.settings.webhook.docLink')}
      </a>
      <div className=' mx-4 lg:mx-20'>
        <WebhookTable
          table={table}
          onRowDelete={id => {
            return deleteMutation({
              variables: {
                id
              }
            })
          }}
        />
      </div>
      <Tooltip
        withArrow
        transitionProps={{
          transition: 'pop',
          duration: 300
        }}
        disabled={isPremium}
        label={!isPremium ? t('app.payment.webhookRequired') : null}>
        <Button
          variant="gradient"
          className='bg-linear-to-br from-indigo-400 to-cyan-500'
          disabled={!isPremium}
          onClick={() => {
            setVisible(true)
          }}
        >
          New
        </Button>
      </Tooltip>

      <Modal
        opened={visible}
        title={t('app.settings.webhook.title')}
        onClose={() => setVisible(false)}
        size={'lg'}
        centered
      >
        <form className='w-full' onSubmit={formik.handleSubmit}>
          <TextInput
            withAsterisk
            type='url'
            className='mt-4'
            size='md'
            label={t('app.settings.webhook.title')}
            placeholder='https://example.com'
            {...formik.getFieldProps('hookUrl')} />
          <div
            className='w-full text-right flex gap-4 justify-end mt-4'
          >
            <Button
              onClick={() => {
                setVisible(false)
              }}
            >
              {t('app.common.cancel')}
            </Button>
            <Tooltip
              withArrow
              transitionProps={{
                transition: 'pop',
                duration: 300
              }}
              disabled={formik.isValid && isPremium}
              label={!isPremium ? t('app.payment.webhookRequired') : (
                formik.errors.hookUrl
              )}
            >
              <Button
                variant="gradient"
                className='bg-linear-to-br from-indigo-400 to-cyan-500'
                disabled={formik.values.hookUrl.length <= 3 || !formik.isValid || !isPremium}
                loading={formik.isSubmitting}
                type='submit'
              >
                {t('app.settings.webhook.submit')}
              </Button>
            </Tooltip>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default WebHooks
