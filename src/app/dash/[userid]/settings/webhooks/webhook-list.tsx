'use client'

import Button from '@annatarhe/lake-ui/button'
import ConfirmDialog from '@annatarhe/lake-ui/confirm-dialog'
import IconButton from '@annatarhe/lake-ui/icon-button'
import Table from '@annatarhe/lake-ui/table'
import { useMutation } from '@apollo/client/react'
import { Trash2 } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import {
  DeleteAWebHookDocument,
  type FetchMyWebHooksQuery,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { WebHookStep } from '@/schema/generated'

type Webhook = FetchMyWebHooksQuery['me']['webhooks'][number]

type WebhookListProps = {
  webhooks: Webhook[]
  basePath: string
}

function WebhookList({ webhooks, basePath }: WebhookListProps) {
  const { t } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const [pending, setPending] = useState<Webhook | null>(null)
  const [deleteWebhook] = useMutation(DeleteAWebHookDocument)

  const onDelete = async () => {
    if (!pending) return
    try {
      await deleteWebhook({ variables: { id: pending.id } })
      toast.success(t('webhooks.deleted'))
      router.refresh()
    } catch (error) {
      toast.error(t('webhooks.deleteFailed'))
      throw error
    }
  }

  return (
    <>
      <Table
        data={webhooks}
        rowKey={(row) => row.id}
        variant="bordered"
        columns={[
          {
            key: 'hookUrl',
            header: t('webhooks.columns.url'),
            render: (_, row) => (
              <span className="text-lake-fg font-mono text-sm break-all">
                {row.hookUrl}
              </span>
            ),
          },
          {
            key: 'step',
            header: t('webhooks.columns.event'),
            render: (_, row) =>
              row.step === WebHookStep.OnCreateClippings
                ? t('webhooks.event.onCreateClippings')
                : t('webhooks.event.unknown'),
          },
          {
            key: 'actions',
            header: t('webhooks.columns.actions'),
            align: 'right',
            render: (_, row) => (
              <span className="inline-flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`${basePath}/${row.id}` as Route} />}
                >
                  {t('webhooks.view')}
                </Button>
                <IconButton
                  variant="ghost"
                  size="sm"
                  label={t('webhooks.delete')}
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setPending(row)}
                />
              </span>
            ),
          },
        ]}
      />
      <ConfirmDialog
        isOpen={!!pending}
        onClose={() => setPending(null)}
        onConfirm={onDelete}
        tone="danger"
        title={t('webhooks.deleteTitle')}
        description={t('webhooks.deleteDescription', {
          url: pending?.hookUrl ?? '',
        })}
        confirmLabel={t('webhooks.confirmDelete')}
        cancelLabel={t('webhooks.cancel')}
      />
    </>
  )
}

export default WebhookList
