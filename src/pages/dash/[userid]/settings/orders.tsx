import React, { useMemo } from 'react'
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useSelector } from 'react-redux'
import { Order, OrderCategory, SubscriptionStatus, useFetchOrdersQuery } from '../../../../schema/generated'
import { TGlobalStore } from '../../../../store'
import { Badge, Button, Chip, Table } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { cancelPaymentSubscription } from '../../../../services/payment'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../../services/misc'


type SubscriptionOrderListProps = {
  orders: Order[]
}

function SubscriptionOrderList(props: SubscriptionOrderListProps) {

  const { orders } = props
  const columnHelper = createColumnHelper<Order>()

  const table = useReactTable({
    data: orders,
    getCoreRowModel: getCoreRowModel(),
    columns: [
      columnHelper.accessor('orderID', {
        header: '订阅 ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('amount', {
        header: '金额',
        cell: (info) => info.getValue() / 100,
      }),
      columnHelper.accessor('currency', {
        header: '货币',
      })
    ]
  })

  return (
    <Table>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )

}

type OrdersTableProps = {
}

function OrdersTable(props: OrdersTableProps) {
  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const { data: orderList, refetch } = useFetchOrdersQuery({
    variables: {
      id: uid
    }
  })

  const { mutate, isLoading } = useMutation({
    mutationFn: async (subscriptionId: string) =>
      toast.promise(
        cancelPaymentSubscription(subscriptionId), toastPromiseDefaultOption),
    onSuccess() {
      refetch()
    }
  })

  return (
    <div className='w-full px-20'>
      {(orderList?.me.orderList ?? []).map(o => (
        <div key={o.id} className='with-fade-in'>
          <div className='flex justify-between'>
            <div className='flex items-center'>
              <h3 className='dark:text-gray-100 mr-2'>{o.subscriptionId}</h3>
              <Badge color={o.status !== SubscriptionStatus.Canceled ? 'green' : undefined}>
                {o.status}
              </Badge>
            </div>
            <Button
              onClick={() => mutate(o.subscriptionId)}
              disabled={o.status === SubscriptionStatus.Canceled || isLoading}
            >
              Cancel
            </Button>
          </div>
          <SubscriptionOrderList orders={o.orders} />
        </div>
      ))}
    </div>
  )
}

export default OrdersTable
