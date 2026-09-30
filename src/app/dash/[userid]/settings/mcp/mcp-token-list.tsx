'use client'

import ConfirmDialog from '@annatarhe/lake-ui/confirm-dialog'
import IconButton from '@annatarhe/lake-ui/icon-button'
import Table from '@annatarhe/lake-ui/table'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'
import type { McpTokenSummary } from '@/server/mcp/tokens'
import { formatDate } from '@/utils/format-date'

type McpTokenListProps = {
  tokens: McpTokenSummary[]
}

function McpTokenList({ tokens }: McpTokenListProps) {
  const { t, i18n } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const [pending, setPending] = useState<McpTokenSummary | null>(null)
  const date = (value: string | null, fallback: string) =>
    value ? formatDate(value, i18n.language) : fallback

  const onRevoke = async () => {
    if (!pending) return
    const response = await fetch(`/api/v3/tokens/${pending.id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      toast.error(t('mcp.tokens.revokeFailed'))
      throw new Error(`revoke failed: ${response.status}`)
    }
    toast.success(t('mcp.tokens.revoked'))
    router.refresh()
  }

  return (
    <>
      <Table
        data={tokens}
        rowKey={(row) => row.id}
        variant="bordered"
        columns={[
          {
            key: 'name',
            header: t('mcp.tokens.columns.name'),
            render: (_, row) => (
              <span className="text-lake-fg font-medium">{row.name}</span>
            ),
          },
          {
            key: 'prefix',
            header: t('mcp.tokens.columns.token'),
            render: (_, row) => (
              <span className="text-lake-fg-muted font-mono text-sm">
                {row.prefix}…
              </span>
            ),
          },
          {
            key: 'lastUsedAt',
            header: t('mcp.tokens.columns.lastUsed'),
            render: (_, row) => date(row.lastUsedAt, t('mcp.tokens.never')),
          },
          {
            key: 'expiresAt',
            header: t('mcp.tokens.columns.expires'),
            render: (_, row) => date(row.expiresAt, t('mcp.tokens.noExpiry')),
          },
          {
            key: 'actions',
            header: t('mcp.tokens.columns.actions'),
            align: 'right',
            render: (_, row) => (
              <IconButton
                variant="ghost"
                size="sm"
                label={t('mcp.tokens.revoke')}
                icon={<Trash2 className="size-4" />}
                onClick={() => setPending(row)}
              />
            ),
          },
        ]}
      />
      <ConfirmDialog
        isOpen={!!pending}
        onClose={() => setPending(null)}
        onConfirm={onRevoke}
        tone="danger"
        title={t('mcp.tokens.revokeTitle')}
        description={t('mcp.tokens.revokeDescription', {
          name: pending?.name ?? '',
        })}
        confirmLabel={t('mcp.tokens.confirmRevoke')}
        cancelLabel={t('mcp.tokens.cancel')}
      />
    </>
  )
}

export default McpTokenList
