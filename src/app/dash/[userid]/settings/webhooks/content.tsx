'use client'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { toast } from 'react-hot-toast'
import { FetchMyWebHooksQuery, useDeleteAWebHookMutation } from '@/schema/generated'
import WebhookTable from '../components/webhook-table'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/i18n/client'

const webhookColumns: ColumnDef<FetchMyWebHooksQuery['me']['webhooks'][0]>[] = [{
  header: 'id',
  accessorKey: 'id'
}, {
  header: 'step',
  accessorKey: 'step'
}, {
  header: 'url',
  accessorKey: 'hookUrl'
}, {
  header: 'action',
}]

type Props = {
  isPremium: boolean
  webhooks: FetchMyWebHooksQuery['me']['webhooks']
}

function WebHooksContent(props: Props) {
  const { webhooks } = props

  const router = useRouter()

  const { t } = useTranslation()

  const [deleteMutation] = useDeleteAWebHookMutation({
    onCompleted: () => {
      router.refresh()
      toast.success(t('app.common.done'))
    }
  })

  const table = useReactTable({
    columns: webhookColumns,
    getCoreRowModel: getCoreRowModel(),
    data: webhooks
  })
  return (
    <WebhookTable
      table={table}
      onRowDelete={id => {
        return deleteMutation({
          variables: {
            id
          }
        })
      }}
    />
  )
}

export default WebHooksContent
