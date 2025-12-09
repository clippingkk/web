'use client'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import { BookOpen } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from '@/i18n/client'
import type { UncheckBooksQueryQuery } from '@/schema/generated'
import HomelessBookSyncInput from './sync-input'

 
const homelessBookColumn: ColumnDef<homelessBookTableItem, any>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Action',
  },
]

type homelessBookTableItem = {
  name: string
}

function HomelessBookTableRow({ row }: { row: Row<homelessBookTableItem> }) {
  return (
    <tr
      key={row.id}
      className='hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 group'
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.columnDef.header === 'Action') {
          return (
            <td key={cell.id} className='px-6 py-5'>
              <HomelessBookSyncInput bookName={cell.row.original.name} />
            </td>
          )
        }
        return (
          <td key={cell.id} className='px-6 py-5'>
            <div className='flex items-center gap-3'>
              <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200'>
                <BookOpen className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </p>
              </div>
            </div>
          </td>
        )
      })}
    </tr>
  )
}

type Props = {
  data: UncheckBooksQueryQuery['adminDashboard']['uncheckedBooks']
}

function HomelessBooksTable(props: Props) {
  const { data } = props
  const { t } = useTranslation()

  const tableData = useMemo(() => {
    const bs = data
    if (!bs) {
      return []
    }
    return (
      bs.map((x) => ({ name: x.title }) as homelessBookTableItem) ||
      ([] as homelessBookTableItem[])
    )
  }, [data])

  const table = useReactTable({
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    columns: homelessBookColumn,
  })

  return (
    <div className='w-full overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th
                    key={column.id}
                    className='px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wide'
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
          <tbody className='divide-y divide-gray-100 dark:divide-gray-700'>
            {table.getRowModel().rows.length > 0 ? (
              table
                .getRowModel()
                .rows.map((row) => (
                  <HomelessBookTableRow row={row} key={row.id} />
                ))
            ) : (
              <tr>
                <td
                  colSpan={homelessBookColumn.length}
                  className='px-6 py-12 text-center'
                >
                  <div className='flex flex-col items-center justify-center space-y-3'>
                    <BookOpen className='h-12 w-12 text-gray-300 dark:text-gray-600' />
                    <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      {t('No homeless books found')}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>
                      {t('All books have been processed and assigned')}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HomelessBooksTable
