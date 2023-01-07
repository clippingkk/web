/* eslint-disable react/jsx-key */
import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useSelector } from 'react-redux'
import { Column, useTable } from 'react-table'
import fetchMyWebHooksQuery from '../../../../schema/fetchMyWebhooks.graphql'
import deleteWebHookMutation from '../../../../schema/mutations/webhook.delete.graphql'
import createNewWebHookMutation from '../../../../schema/mutations/webhook.create.graphql'
import { fetchMyWebHooks, fetchMyWebHooksVariables, fetchMyWebHooks_me_webhooks } from '../../../../schema/__generated__/fetchMyWebHooks'
import { TGlobalStore } from '../../../../store'
import Dialog from '../../../../components/dialog/dialog'
import FieldInput from '../../../../components/input'
import { useFormik } from 'formik'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import { WebHookStep } from '../../../../../__generated__/globalTypes'
import { createNewWebHook, createNewWebHookVariables } from '../../../../schema/mutations/__generated__/createNewWebHook'
import { deleteAWebHook, deleteAWebHookVariables } from '../../../../schema/mutations/__generated__/deleteAWebHook'
import { useTranslation } from 'react-i18next'
import { Button, Table } from '@mantine/core'
import { toastPromiseDefaultOption } from '../../../../services/misc'

const webhookColumns: Column<fetchMyWebHooks_me_webhooks>[] = [{
  Header: 'id',
  accessor: 'id'
}, {
  Header: 'step',
  accessor: 'step'
}, {
  Header: 'url',
  accessor: 'hookUrl'
}, {
  Header: 'action',
}]

function WebHooks() {
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const { data: webhooksResp, client, refetch } = useQuery<fetchMyWebHooks, fetchMyWebHooksVariables>(fetchMyWebHooksQuery, {
    variables: {
      id: uid
    },
    skip: uid <= 0
  })

  const { t } = useTranslation()

  const [createMutation] = useMutation<createNewWebHook, createNewWebHookVariables>(createNewWebHookMutation)
  const [deleteMutation] = useMutation<deleteAWebHook, deleteAWebHookVariables>(deleteWebHookMutation)

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
          step: WebHookStep.onCreateClippings,
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable<fetchMyWebHooks_me_webhooks>({
    columns: webhookColumns,
    data: webhooksResp?.me.webhooks ?? [] as any
  })

  return (
    <div className='w-full text-center'>
      <div className=' mx-4 lg:mx-20'>
        <Table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              // eslint-disable-next-line react/jsx-key
              <tr
                {...headerGroup.getHeaderGroupProps()}
              >
                {headerGroup.headers.map(column => (
                  // eslint-disable-next-line react/jsx-key
                  <th
                    {...column.getHeaderProps()}
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={webhookColumns.length}
                >
                  {t('app.menu.search.empty')}
                </td>
              </tr>
            )}
            {rows.map(row => {
              prepareRow(row)
              return (
                <tr
                  {...row.getRowProps()}
                  className='with-fade-in'
                >
                  {row.cells.map(cell => {
                    if (cell.column.Header === 'action') {
                      return (
                        <td
                          {...cell.getCellProps()}
                        >
                          <Button
                            variant="gradient"
                            className='bg-gradient-to-br from-orange-400 to-red-500'
                            onClick={() => {
                              deleteMutation({
                                variables: {
                                  id: cell.row.values.id
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
                      // eslint-disable-next-line react/jsx-key
                      <td
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
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
