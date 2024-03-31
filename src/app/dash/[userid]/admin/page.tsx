'use client'
import React, { useMemo, useState } from 'react'
import { useReactTable, Row, getCoreRowModel, ColumnDef, flexRender } from '@tanstack/react-table'
import HomelessBookSyncInput from './sync-input'
import { useUncheckBooksQueryQuery } from '../../../../schema/generated'
import { Box, NumberInput, Table } from '@mantine/core'

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

function AdminPanel() {
  const [offset, setOffset] = useState(0)
  const { data, loading } = useUncheckBooksQueryQuery({
    variables: {
      pagination: {
        limit: 50,
        offset
      }
    }
  })
  const tableData = useMemo(() => {
    const bs = data?.adminDashboard.uncheckedBooks
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
    <div className='container mx-auto'>
      <Box>
        <>
          <h3 className='text-3xl text-center dark:text-gray-50 my-8'>无家可归的书目们</h3>
          <NumberInput
            size='lg'
            value={offset}
            onChange={(val) => setOffset(~~val)}
            placeholder="offset"
            className='my-4'
          />
          {data ? (
            <Table
              className='w-full'
              striped
              highlightOnHover
            >
              <Table.Thead>
                {table.getHeaderGroups().map(headerGroup => (
                  // eslint-disable-next-line react/jsx-key
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
                {table.getRowModel().rows.map((row, i) => {
                  return (<HomelessBookTableRow row={row} key={row.id} />)
                })}
              </Table.Tbody>
            </Table>
          ) : (
            loading ? (<span>loading</span>) : (<span>no more</span>)
          )}
        </>
      </Box>
    </div>
  )
}

export default AdminPanel
