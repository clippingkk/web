/* eslint-disable react/jsx-key */
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { TGlobalStore } from '../../../../store'
import Dialog from '../../../../components/dialog/dialog'
import FieldInput from '../../../../components/input'
import { useFormik } from 'formik'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button, Table } from '@mantine/core'
import { FetchMyWebHooksQuery, useCreateNewWebHookMutation, useDeleteAWebHookMutation, useFetchMyWebHooksQuery, WebHookItem, WebHookStep } from '../../../../schema/generated'

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
  const { data: webhooksResp, client, refetch } = useFetchMyWebHooksQuery({
    variables: {
      id: uid
    },
    skip: uid <= 0
  })

  const { t } = useTranslation()

  const [createMutation] = useCreateNewWebHookMutation()
  const [deleteMutation] = useDeleteAWebHookMutation()

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
      <div className=' mx-4 lg:mx-20'>
        <Table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  // eslint-disable-next-line react/jsx-key
                  <th
                    key={column.id}
                  >
                    {flexRender(column.column.columnDef.header, column.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={webhookColumns.length}
                >
                  {t('app.menu.search.empty')}
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map(row => {
              return (
                <tr
                  key={row.id}
                  className='with-fade-in'
                >
                  {row.getVisibleCells().map(cell => {
                    if (cell.column.columnDef.header === 'action') {
                      return (
                        <td key={cell.id}>
                          <Button
                            variant="gradient"
                            className='bg-gradient-to-br from-orange-400 to-red-500'
                            onClick={() => {
                              return deleteMutation({
                                variables: {
                                  id: cell.row.getValue('id')
                                }
                              }).then(() => {
                                client.resetStore()
                                toast.success(t('app.common.done'))
                              })
                            }}
                          >{t('app.common.delete')}</Button>
                        </td>
                      )
                    }
                    return (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
      <Button
        variant="gradient"
        className='bg-gradient-to-br from-indigo-400 to-cyan-500'
        onClick={() => {
          setVisible(true)
        }}
      >
        New
      </Button>

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
                <Button
                  variant="gradient"
                  className='bg-gradient-to-br from-indigo-400 to-cyan-500'
                  disabled={formik.values.hookUrl.length <= 3 || !formik.isValid}
                  loading={formik.isSubmitting}
                  type='submit'
                >
                  {t('app.settings.webhook.submit')}
                </Button>
              </div>

            </form>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default WebHooks
