import { Order } from '@/schema/generated'
import { useTranslation } from '@/i18n/client'
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Table } from '@mantine/core'

type SubscriptionOrderListProps = {
  orders: Order[]
}

function SubscriptionContent(props: SubscriptionOrderListProps) {
  const { t } = useTranslation()
  const { orders } = props
  const columnHelper = createColumnHelper<Order>()

  const table = useReactTable({
    data: orders,
    getCoreRowModel: getCoreRowModel(),
    columns: [
      columnHelper.accessor('orderID', {
        header: t('app.settings.orders.orderId') ?? '',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('amount', {
        header: t('app.settings.orders.amount') ?? '',
        cell: (info) => info.getValue() / 100,
      }),
      columnHelper.accessor('currency', {
        header: t('app.settings.orders.currency') ?? '',
      })
    ]
  })

  return (
    <Table className='dark:text-gray-100'>
      <Table.Thead>
        {table.getHeaderGroups().map(headerGroup => (
          <Table.Tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <Table.Th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </Table.Th>
            ))}
          </Table.Tr>
        ))}
      </Table.Thead>
      <Table.Tbody>
        {table.getRowModel().rows.map(row => (
          <Table.Tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <Table.Td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )

}

export default SubscriptionContent
