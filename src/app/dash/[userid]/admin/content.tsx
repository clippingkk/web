'use client'
import React, { useMemo } from 'react'
import { useReactTable, Row, getCoreRowModel, ColumnDef, flexRender } from '@tanstack/react-table'
import HomelessBookSyncInput from './sync-input'
import { UncheckBooksQueryQuery } from '@/schema/generated'
import { BookOpen } from 'lucide-react'
import { useTranslation } from '@/i18n/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const homelessBookColumn: ColumnDef<homelessBookTableItem, any>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Action'
  }
]

type homelessBookTableItem = {
  name: string
}

function HomelessBookTableRow({ row }: { row: Row<homelessBookTableItem> }) {
  return (
    <tr key={row.id} className='border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
      {row.getVisibleCells().map(cell => {
        if (cell.column.columnDef.header === 'Action') {
          return (
            <td key={cell.id} className='px-6 py-4'>
              <HomelessBookSyncInput bookName={cell.row.original.name} />
            </td>
          )
        }
        return (
          <td key={cell.id} className='px-6 py-4'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4 text-indigo-500' />
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    return bs.map(x => ({ name: x.title } as homelessBookTableItem)) || ([] as homelessBookTableItem[])
  }, [data])
  
  const table = useReactTable({
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    columns: homelessBookColumn
  })

  return (
    <div className='w-full overflow-hidden rounded-lg shadow-md'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead className='bg-gray-50 dark:bg-gray-800'>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  <th key={column.id} className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300'>
                    {flexRender(column.column.columnDef.header, column.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900'>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <HomelessBookTableRow row={row} key={row.id} />
              ))
            ) : (
              <tr>
                <td colSpan={homelessBookColumn.length} className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
                  {t('No homeless books found')}
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
