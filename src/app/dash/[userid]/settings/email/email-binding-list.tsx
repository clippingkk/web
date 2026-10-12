'use client'

import Badge from '@annatarhe/lake-ui/badge'
import Button from '@annatarhe/lake-ui/button'
import ConfirmDialog from '@annatarhe/lake-ui/confirm-dialog'
import IconButton from '@annatarhe/lake-ui/icon-button'
import Table from '@annatarhe/lake-ui/table'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'
import type { EmailBindingSummary } from '@/server/email-import/bindings'
import { formatDate } from '@/utils/format-date'

import EmailBindingDialog from './email-binding-dialog'

type EmailBindingListProps = {
  bindings: EmailBindingSummary[]
  max: number
}

function EmailBindingList({ bindings, max }: EmailBindingListProps) {
  const { t, i18n } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const [verifying, setVerifying] = useState<EmailBindingSummary | null>(null)
  const [removing, setRemoving] = useState<EmailBindingSummary | null>(null)

  const onRemove = async () => {
    if (!removing) return
    const response = await fetch(`/api/v3/email-bindings/${removing.id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      toast.error(t('email.bindings.removeFailed'))
      throw new Error(`remove failed: ${response.status}`)
    }
    toast.success(t('email.bindings.removed'))
    router.refresh()
  }

  return (
    <>
      <Table
        data={bindings}
        rowKey={(row) => row.id}
        variant="bordered"
        columns={[
          {
            key: 'email',
            header: t('email.bindings.columns.email'),
            render: (_, row) => (
              <div className="flex flex-col items-start gap-1">
                <span className="text-lake-fg font-medium whitespace-nowrap">
                  {row.email}
                </span>
                {row.verified ? (
                  <Badge tone="success" size="sm">
                    {t('email.bindings.verified')}
                  </Badge>
                ) : (
                  <Badge tone="warning" size="sm">
                    {t('email.bindings.pending')}
                  </Badge>
                )}
              </div>
            ),
          },
          {
            key: 'lastImportedAt',
            header: t('email.bindings.columns.lastImport'),
            render: (_, row) => (
              <span className="whitespace-nowrap">
                {row.lastImportedAt
                  ? formatDate(row.lastImportedAt, i18n.language)
                  : t('email.bindings.never')}
              </span>
            ),
          },
          {
            key: 'actions',
            header: t('email.bindings.columns.actions'),
            align: 'right',
            render: (_, row) => (
              <div className="flex items-center justify-end gap-1">
                {row.verified ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVerifying(row)}
                  >
                    {t('email.bindings.verify')}
                  </Button>
                )}
                <IconButton
                  variant="ghost"
                  size="sm"
                  label={t('email.bindings.remove')}
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setRemoving(row)}
                />
              </div>
            ),
          },
        ]}
      />
      <EmailBindingDialog
        key={verifying?.id ?? 'closed'}
        isOpen={!!verifying}
        onClose={() => setVerifying(null)}
        binding={verifying}
        max={max}
      />
      <ConfirmDialog
        isOpen={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={onRemove}
        tone="danger"
        title={t('email.bindings.removeTitle')}
        description={t('email.bindings.removeDescription', {
          email: removing?.email ?? '',
        })}
        confirmLabel={t('email.bindings.confirmRemove')}
        cancelLabel={t('email.bindings.cancel')}
      />
    </>
  )
}

export default EmailBindingList
