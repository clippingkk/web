import EmptyState from '@annatarhe/lake-ui/empty-state'
import { KeyRound } from 'lucide-react'
import type { Metadata } from 'next'

import { SettingsSection } from '@/components/settings/settings-section'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewer } from '@/server/data/viewer'
import { getServerEnv } from '@/server/env'
import { listMcpTokens } from '@/server/mcp/tokens'

import CopyBlock from './copy-block'
import CreateMcpToken from './create-mcp-token'
import McpTokenList from './mcp-token-list'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('mcp.title') })
}

export default async function McpSettingsPage() {
  const [viewer, { t }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'settings'),
  ])
  const tokens = await listMcpTokens(viewer.id)
  const endpoint = new URL('/api/v3/mcp', getServerEnv().APP_ORIGIN).toString()

  return (
    <>
      <SettingsSection
        title={t('mcp.title')}
        description={t('mcp.description')}
      >
        <div className="flex flex-col gap-6">
          <CopyBlock label={t('mcp.endpoint')} value={endpoint} />
          <div className="flex flex-col gap-2">
            <h3 className="type-body text-lake-fg font-medium">
              {t('mcp.oauthTitle')}
            </h3>
            <p className="text-lake-fg-muted text-sm">
              {t('mcp.oauthDescription')}
            </p>
            <CopyBlock
              value={`claude mcp add --transport http clippingkk ${endpoint}`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="type-body text-lake-fg font-medium">
              {t('mcp.tokenTitle')}
            </h3>
            <p className="text-lake-fg-muted text-sm">
              {t('mcp.tokenDescription')}
            </p>
            <CopyBlock
              value={`claude mcp add --transport http clippingkk ${endpoint} \\\n  --header "Authorization: Bearer <token>"`}
            />
            <CopyBlock
              value={JSON.stringify(
                {
                  mcpServers: {
                    clippingkk: {
                      type: 'http',
                      url: endpoint,
                      headers: { Authorization: 'Bearer <token>' },
                    },
                  },
                },
                null,
                2
              )}
            />
          </div>
        </div>
      </SettingsSection>
      <SettingsSection
        title={t('mcp.tokens.title')}
        description={t('mcp.tokens.description')}
        actions={<CreateMcpToken />}
      >
        {tokens.length ? (
          <McpTokenList tokens={tokens} />
        ) : (
          <EmptyState
            icon={<KeyRound className="size-6" />}
            title={t('mcp.tokens.emptyTitle')}
            description={t('mcp.tokens.emptyDescription')}
          />
        )}
      </SettingsSection>
    </>
  )
}
