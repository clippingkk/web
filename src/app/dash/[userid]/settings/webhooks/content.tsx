'use client'
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { useMutation } from '@apollo/client/react'
import {
  DeleteAWebHookDocument,
  type DeleteAWebHookMutation,
  type FetchMyWebHooksQuery,
  WebHookStep,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import WebhookTable from '../components/webhook-table'

type Props = {
  isPremium: boolean
  webhooks: FetchMyWebHooksQuery['me']['webhooks']
  userId: string
}

function WebHooksContent(props: Props) {
  const { webhooks, userId } = props

  const router = useRouter()

  const { t } = useTranslation()

  const [deleteMutation] = useMutation<DeleteAWebHookMutation>(DeleteAWebHookDocument, {
    onCompleted: () => {
      router.refresh()
      toast.success(t('app.common.done'))
    },
  })

  const webhookColumns: ColumnDef<FetchMyWebHooksQuery['me']['webhooks'][0]>[] =
    useMemo(
      () => [
        {
          header: 'id',
          accessorKey: 'id',
        },
        {
          header: 'step',
          accessorKey: 'step',
          cell: ({ row }) => {
            const step = row.getValue('step')
            if (step === WebHookStep.OnCreateClippings) {
              return 'on create clippings'
            }
            return 'Unknown'
          },
        },
        {
          header: 'url',
          accessorKey: 'hookUrl',
        },
        {
          header: 'action',
          cell: ({ row }) => {
            return (
              <div className='flex items-center gap-3'>
                <Link
                  href={`/dash/${userId}/settings/webhooks/${row.getValue('id')}`}
                  className='group flex items-center gap-2 rounded-lg bg-indigo-500/90 px-4 py-2 font-medium text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg dark:bg-indigo-600/90 dark:hover:bg-indigo-700'
                >
                  <span className='transition-transform group-hover:translate-x-0.5'>
                    {t('View Detail')}
                  </span>
                </Link>
                <button
                  className='group flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 font-medium text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-red-600 hover:shadow-lg dark:bg-red-600/90 dark:hover:bg-red-700'
                  onClick={() =>
                    deleteMutation({ variables: { id: row.getValue('id') } })
                  }
                >
                  <Trash2 className='h-4 w-4 transition-transform group-hover:scale-110' />
                  <span>{t('app.common.delete')}</span>
                </button>
              </div>
            )
          },
        },
      ],
      [t, deleteMutation, userId]
    )

  const table = useReactTable({
    columns: webhookColumns,
    getCoreRowModel: getCoreRowModel(),
    data: webhooks,
  })
  return <WebhookTable table={table} />
}

export default WebHooksContent
