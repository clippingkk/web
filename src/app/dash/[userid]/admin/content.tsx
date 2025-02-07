'use client'
import React, { useMemo } from 'react'
import { useReactTable, Row, getCoreRowModel, ColumnDef, flexRender } from '@tanstack/react-table'
import HomelessBookSyncInput from './sync-input'
import { Table } from '@mantine/core'
import { uncheckBooksQuery } from '@/schema/__generated__/uncheckBooksQuery'

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
    <Table.Tr key={row.id} className=''>
      {row.getVisibleCells().map(cell => {
        if (cell.column.columnDef.header === 'Action') {
          return (
            <Table.Td key={cell.id}>
              <HomelessBookSyncInput bookName={cell.row.original.name} />
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
}

type Props = {
  data: uncheckBooksQuery['adminDashboard']['uncheckedBooks']
}

function HomelessBooksTable(props: Props) {
  const { data } = props
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
    <Table
      className='w-full'
      striped
      highlightOnHover
    >
      <Table.Thead>
        {table.getHeaderGroups().map(headerGroup => (

          <Table.Tr key={headerGroup.id}>
            {headerGroup.headers.map(column => (
              <Table.Th className='' key={column.id}>
                {
                  flexRender(column.column.columnDef.header, column.getContext())
                }
              </Table.Th>
            ))}
          </Table.Tr>
        ))}
      </Table.Thead>
      <Table.Tbody>
        {table.getRowModel().rows.map((row) => {
          return (<HomelessBookTableRow row={row} key={row.id} />)
        })}
      </Table.Tbody>
    </Table>
  )
}

export default HomelessBooksTable
