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
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { UserContent } from '../../../../store/user/type'

type SubscriptionOrderListProps = {
  orders: Order[]
}

function SubscriptionOrderList(props: SubscriptionOrderListProps) {
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
    <Table className=' dark:text-gray-100'>
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
  const p = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const uid = p.id

  const { data: orderList, refetch } = useFetchOrdersQuery({
    variables: {
      id: uid
    },
    skip: uid <= 0
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (subscriptionId: string) =>
      toast.promise(
        cancelPaymentSubscription(subscriptionId), toastPromiseDefaultOption),
    onSuccess() {
      refetch()
    }
  })
  const { t } = useTranslation()
  return (
    <div className='w-full px-20'>
      {orderList?.me.orderList.length === 0 && (
        <div className='flex justify-center'>
          <Button
            component={Link}
            href='/pricing'
            variant='gradient'
            gradient={{ from: 'indigo', to: 'cyan', deg: 105 }}
            className='active:scale-95'
          >
            {t('app.plan.premium.goto')}
          </Button>
        </div>
      )}
      {(orderList?.me.orderList ?? []).map(o => (
        <div key={o.id} className='with-fade-in'>
          <div className='flex justify-between'>
            <div className='flex items-center'>
              <h3 className='dark:text-gray-100 mr-2 ml-3'>{o.subscriptionId}</h3>
              <Badge color={o.status !== SubscriptionStatus.Canceled ? 'green' : undefined}>
                {o.status}
              </Badge>
            </div>
            <Button
              onClick={() => mutate(o.subscriptionId)}
              disabled={o.status === SubscriptionStatus.Canceled || isPending}
            >
              {t('app.common.cancel')}
            </Button>
          </div>
          <SubscriptionOrderList orders={o.orders} />
        </div>
      ))}
    </div>
  )
}

export default OrdersTable
