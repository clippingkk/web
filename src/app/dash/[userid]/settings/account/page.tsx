import { buttonStyles } from '@annatarhe/lake-ui/button'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { connection } from 'next/server'

import {
  SettingsCard,
  SettingsRow,
  SettingsSection,
} from '@/components/settings/settings-section'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { getViewer } from '@/server/data/viewer'
import { gateConfig } from '@/server/gate/config'

import AccountRemoveButton from './AccountRemoveButton'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('account.title') })
}

export default async function AccountPage() {
  // Gate configuration is runtime-only; read it after the request boundary.
  await connection()
  const [{ t }, viewer] = await Promise.all([
    getTranslation(undefined, 'settings'),
    getViewer(),
  ])

  return (
    <SettingsSection
      title={t('account.title')}
      description={t('account.description')}
    >
      <SettingsCard>
        <SettingsRow
          label={t('account.gateTitle')}
          description={t('account.gateDescription')}
          control={
            <a
              href={`${gateConfig().baseUrl}/account`}
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
            >
              {t('account.gateLink')}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          }
        />
        <SettingsRow
          label={t('account.deleteTitle')}
          description={t('account.deleteDescription')}
          control={<AccountRemoveButton name={viewer?.name ?? ''} />}
        />
      </SettingsCard>
    </SettingsSection>
  )
}
