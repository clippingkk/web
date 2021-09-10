import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useSelector } from 'react-redux'
import { Column, useTable } from 'react-table'
import fetchMyWebHooksQuery from '../../schema/fetchMyWebhooks.graphql'
import deleteWebHookMutation from '../../schema/mutations/webhook.delete.graphql'
import createNewWebHookMutation from '../../schema/mutations/webhook.create.graphql'
import { fetchMyWebHooks, fetchMyWebHooksVariables, fetchMyWebHooks_me_webhooks } from '../../../../schema/__generated__/fetchMyWebHooks'
import { TGlobalStore } from '../../../../store'
import Dialog from '../../../../components/dialog/dialog'
import FieldInput from '../../../../components/input'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { WebHookStep } from '../../../../../__generated__/globalTypes'
import { createNewWebHook, createNewWebHookVariables } from '../../../../schema/mutations/__generated__/createNewWebHook'
import { deleteAWebHook, deleteAWebHookVariables } from '../../../../schema/mutations/__generated__/deleteAWebHook'
import { useTranslation } from 'react-i18next'

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
      createMutation({
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
      }).catch(e => {
        toast.error(e.toString())
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
      <table {...getTableProps()} className='table-auto mx-auto dark:text-white'>
        <thead className='w-full'>
          {headerGroups.map(headerGroup => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              className='table-row'
            >
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps()}
                  className='table-cell py-2 px-8 dark:border-white border-gray-300 border-2'
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className='table-row-group'>
          {rows.length === 0 && (
            <tr className='table-row'>
              <td
                className='table-cell py-2 px-4 border-2 text-base my-4'
                colSpan={webhookColumns.length}
              >
                {t('app.menu.search.empty')}
              </td>
            </tr>
          )}
          {rows.map(row => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} className='table-row with-fade-in'>
                {row.cells.map(cell => {
                  if (cell.column.Header === 'action') {
                    return (
                      <td
                        {...cell.getCellProps()}
                        className='table-cell py-2 px-4 border-2'
                      >
                        <button
                          className='from-red-400 to-red-600 py-4 px-8 rounded hover:shadow-lg bg-gradient-to-br duration-300 dark:text-gray-200 hover:scale-110 transform focus:outline-none m-4'
                          onClick={() => {
                            deleteMutation({
                              variables: {
                                id: cell.row.values.id
                              }
                            }).then(() => {
                              client.resetStore()
                              toast.success(t('app.common.done'))
                            }).catch(err => {
                              toast.error(err.toString())
                            })
                          }}
                        >{t('app.common.delete')}</button>
                      </td>
                    )
                  }
                  return (
                    <td
                      {...cell.getCellProps()}
                      className='table-cell py-2 px-4 border-2'
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <button
        className='from-blue-400 to-blue-600 py-4 px-8 rounded hover:shadow-lg bg-gradient-to-br duration-300 dark:text-gray-200 hover:scale-110 transform focus:outline-none mx-4 mt-4'
        onClick={() => {
          setVisible(true)
        }}
      >New</button>

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
                <button
                  className='w-64 bg-blue-400 rounded py-4 hover:bg-blue-500 duration-150 disabled:bg-gray-400'
                  disabled={formik.values.hookUrl.length <= 3 || !formik.isValid}
                  type='submit'
                >
                  {t('app.settings.webhook.submit')}
                </button>
              </div>

            </form>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default WebHooks
