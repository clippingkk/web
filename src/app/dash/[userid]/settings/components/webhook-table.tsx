import { Table as TableDef, flexRender } from '@tanstack/react-table'
import React from 'react'
import { useTranslation } from '@/i18n/client'
import { FetchMyWebHooksQuery } from '@/schema/generated'
import { Trash2 } from 'lucide-react'

type WebhookTableProps = {
  table: TableDef<FetchMyWebHooksQuery['me']['webhooks'][0]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowDelete: (id: number) => Promise<any>
}

function WebhookTable(props: WebhookTableProps) {
  const { t } = useTranslation()
  const { table, onRowDelete } = props
  
  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="flex justify-center items-center my-12 p-8 rounded-xl bg-gray-100/10 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-100/10 dark:border-gray-800/30">
        <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          {t('app.menu.search.empty')}
        </span>
      </div>
    )
  }
  
  return (
    <div className="w-full overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-gray-100/20 dark:border-gray-800/30 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-200/10 dark:border-gray-700/30">
                {headerGroup.headers.map(column => (
                  <th
                    key={column.id}
                    className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 bg-gray-100/20 dark:bg-gray-800/30"
                  >
                    {flexRender(column.column.columnDef.header, column.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody className="divide-y divide-gray-200/10 dark:divide-gray-700/30">
            {table.getRowModel().rows.map(row => {
              return (
                <tr
                  key={row.id}
                  className="with-fade-in transition-all duration-200 hover:bg-gray-100/10 dark:hover:bg-gray-800/20"
                >
                  {row.getVisibleCells().map(cell => {
                    if (cell.column.columnDef.header === 'action') {
                      return (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 group"
                            onClick={() => onRowDelete(cell.row.getValue('id'))}
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>{t('app.common.delete')}</span>
                          </button>
                        </td>
                      )
                    }
                    return (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WebhookTable
