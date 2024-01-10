'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { TGlobalStore } from '../../../../../store'
import Dialog from '../../../../../components/dialog/dialog'
import FieldInput from '../../../../../components/input'
import { useFormik } from 'formik'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button, Table, Tooltip } from '@mantine/core'
import { FetchMyWebHooksQuery, useCreateNewWebHookMutation, useDeleteAWebHookMutation, useFetchMyWebHooksQuery, useProfileQuery, WebHookItem, WebHookStep } from '../../../../../schema/generated'
import { useIsPremium } from '../../../../../hooks/profile'
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
          className='bg-gradient-to-br from-indigo-400 to-cyan-500'
          disabled={!isPremium}
          onClick={() => {
            setVisible(true)
          }}
        >
          New
        </Button>
      </Tooltip>

      {visible && (
        <Dialog
          title={t('app.settings.webhook.title')}
          onCancel={() => setVisible(false)}
          onOk={() => formik.handleSubmit()}
        >
          <div className='w-full'>
            <form className='w-full' onSubmit={formik.handleSubmit}>
              <FieldInput
                name='hookUrl'
                value={formik.values.hookUrl}
                error={formik.errors.hookUrl}
                onChange={formik.handleChange}
                type='url'
              />
              <div
                className='w-full text-right'
              >
                <Tooltip
                  withArrow
                  transitionProps={{
                    transition: 'pop',
                    duration: 300
                  }}
                  disabled={isPremium}
                  label={!isPremium ? t('app.payment.webhookRequired') : null}
                >
                  <Button
                    variant="gradient"
                    className='bg-gradient-to-br from-indigo-400 to-cyan-500'
                    disabled={formik.values.hookUrl.length <= 3 || !formik.isValid || !isPremium}
                    loading={formik.isSubmitting}
                    type='submit'
                  >
                    {t('app.settings.webhook.submit')}
                  </Button>
                </Tooltip>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default WebHooks
