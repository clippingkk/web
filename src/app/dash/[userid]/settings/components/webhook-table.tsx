import { Table, Button } from '@mantine/core'
import { Table as TableDef, flexRender } from '@tanstack/react-table'
import React from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { FetchMyWebHooksQuery, useDeleteAWebHookMutation } from '../../../../../schema/generated'

type WebhookTableProps = {
  table: TableDef<FetchMyWebHooksQuery['me']['webhooks'][0]>
  onRowDelete: (id: number) => Promise<any>
}

function WebhookTable(props: WebhookTableProps) {
  const { t } = useTranslation()
  const { table, onRowDelete } = props
  if (table.getRowModel().rows.length === 0) {
    return (
      <div className='my-8'>
        <span>
          {t('app.menu.search.empty')}
        </span>
      </div>
    )
  }
  return (
    <Table>
      <Table.Thead>
        {table.getHeaderGroups().map(headerGroup => (
          <Table.Tr key={headerGroup.id}>
            {headerGroup.headers.map(column => (
              // eslint-disable-next-line react/jsx-key
              <Table.Th
                key={column.id}
              >
                {flexRender(column.column.columnDef.header, column.getContext())}
              </Table.Th>
            ))}
          </Table.Tr>
        ))}
      </Table.Thead>
      <Table.Tbody>
        {table.getRowModel().rows.map(row => {
          return (
            <Table.Tr
              key={row.id}
              className='with-fade-in'
            >
              {row.getVisibleCells().map(cell => {
                if (cell.column.columnDef.header === 'action') {
                  return (
                    <Table.Td key={cell.id}>
                      <Button
                        variant="gradient"
                        className='bg-gradient-to-br from-orange-400 to-red-500'
                        onClick={() => {
                          return onRowDelete(cell.row.getValue('id'))
                        }}
                      >{t('app.common.delete')}</Button>
                    </Table.Td>
                  )
                }
                return (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                )
              })}
            </Table.Tr>
          )
        })}
      </Table.Tbody>
    </Table>
  )
}

export default WebhookTable
