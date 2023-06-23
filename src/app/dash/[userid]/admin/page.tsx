'use client'
import React, { useState } from 'react'
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
    <tr key={row.id} className=''>
      {row.getVisibleCells().map(cell => {
        if (cell.column.columnDef.header === 'Action') {
          return (
            <td key={cell.id}>
              <HomelessBookSyncInput bookName={cell.getValue<string>()} />
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
  const table = useReactTable({
    data: data?.adminDashboard.uncheckedBooks.map(x => ({ name: x.title } as homelessBookTableItem)) || ([] as homelessBookTableItem[]),
    getCoreRowModel: getCoreRowModel(),
    columns: homelessBookColumn
  })

  return (
    <div>
      <Box>
        <>
          <h3 className='text-3xl text-center dark:text-gray-50 my-8'>无家可归的书目们</h3>
          <NumberInput
            type="number"
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
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  // eslint-disable-next-line react/jsx-key
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(column => (
                      <th className='' key={column.id}>
                        {
                          flexRender(column.column.columnDef.header, column.getContext())
                        }
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => {
                  return (<HomelessBookTableRow row={row} key={row.id} />)
                })}
              </tbody>
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
