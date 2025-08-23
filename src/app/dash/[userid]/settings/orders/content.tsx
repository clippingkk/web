'use client'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Calendar, CreditCard, Receipt } from 'lucide-react'
import type { Order } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

type SubscriptionOrderListProps = {
  orders: Order[]
}

function SubscriptionContent(props: SubscriptionOrderListProps) {
  const { t } = useTranslation()
  const { orders } = props
  const columnHelper = createColumnHelper<Order>()

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    })
    return formatter.format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      formatted: date.toLocaleDateString(),
      relative: getRelativeTimeString(date),
    }
  }

  const getRelativeTimeString = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.round(diffMs / 1000)
    const diffMins = Math.round(diffSecs / 60)
    const diffHours = Math.round(diffMins / 60)
    const diffDays = Math.round(diffHours / 24)
    const diffMonths = Math.round(diffDays / 30)
    const diffYears = Math.round(diffDays / 365)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
  }

  const table = useReactTable({
    data: orders,
    getCoreRowModel: getCoreRowModel(),
    columns: [
      columnHelper.accessor('orderID', {
        header: () => (
          <div className='flex items-center space-x-2'>
            <Receipt
              size={16}
              className='text-indigo-500 dark:text-indigo-400'
            />
            <span>{t('app.settings.orders.orderId')}</span>
          </div>
        ),
        cell: (info) => (
          <div className='font-mono text-xs md:text-sm'>{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor('amount', {
        header: () => (
          <div className='flex items-center space-x-2'>
            <CreditCard
              size={16}
              className='text-indigo-500 dark:text-indigo-400'
            />
            <span>{t('app.settings.orders.amount')}</span>
          </div>
        ),
        cell: (info) => {
          const currency = info.row.original.currency || 'USD'
          return (
            <span className='font-medium'>
              {formatCurrency(info.getValue(), currency)}
            </span>
          )
        },
      }),
      columnHelper.accessor('currency', {
        header: t('app.settings.orders.currency') ?? '',
        cell: (info) => (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 uppercase'>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('orderCreatedAt', {
        header: () => (
          <div className='flex items-center space-x-2'>
            <Calendar
              size={16}
              className='text-indigo-500 dark:text-indigo-400'
            />
            <span>{t('app.settings.orders.date')}</span>
          </div>
        ),
        cell: (info) => {
          const { formatted, relative } = formatDate(info.getValue())
          return (
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              <div>{formatted}</div>
              <div className='text-xs'>{relative}</div>
            </div>
          )
        },
      }),
    ],
  })

  return (
    <div className='rounded-lg overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-700'>
          <thead className='bg-slate-100 dark:bg-slate-700/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className='py-4 px-4 text-left text-slate-700 dark:text-slate-300 font-medium'
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-white/30 dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700'>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className='transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30'
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className='py-4 px-4 whitespace-nowrap border-t border-slate-200 dark:border-slate-700'
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className='py-12 text-center text-slate-500 dark:text-slate-400'
                >
                  <div className='flex flex-col items-center justify-center space-y-2'>
                    <Receipt size={32} className='opacity-40' />
                    <p className='text-sm'>{t('app.settings.orders.empty')}</p>
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

export default SubscriptionContent
