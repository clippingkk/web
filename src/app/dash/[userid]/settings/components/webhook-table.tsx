import { flexRender, type Table as TableDef } from '@tanstack/react-table'
import { useTranslation } from '@/i18n/client'
import type { FetchMyWebHooksQuery } from '@/schema/generated'

type WebhookTableProps = {
  table: TableDef<FetchMyWebHooksQuery['me']['webhooks'][0]>
}

function WebhookTable(props: WebhookTableProps) {
  const { t } = useTranslation()
  const { table } = props

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className='my-12 flex items-center justify-center rounded-xl border border-gray-100/10 bg-gray-100/10 p-8 backdrop-blur-sm dark:border-gray-800/30 dark:bg-gray-800/20'>
        <span className='text-lg font-medium text-gray-500 dark:text-gray-400'>
          {t('app.menu.search.empty')}
        </span>
      </div>
    )
  }

  return (
    <div className='w-full overflow-hidden rounded-xl border border-gray-100/20 bg-white/10 shadow-lg backdrop-blur-md dark:border-gray-800/30'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className='border-b border-gray-200/10 dark:border-gray-700/30'
              >
                {headerGroup.headers.map((column) => (
                  <th
                    key={column.id}
                    className='bg-gray-100/20 px-6 py-4 text-left text-sm font-bold tracking-wider text-gray-700 uppercase dark:bg-gray-800/30 dark:text-gray-300'
                  >
                    {flexRender(
                      column.column.columnDef.header,
                      column.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className='divide-y divide-gray-200/10 dark:divide-gray-700/30'>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  className='with-fade-in transition-all duration-200 hover:bg-gray-100/10 dark:hover:bg-gray-800/20'
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className='px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300'
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
