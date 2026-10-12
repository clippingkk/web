import EmptyState from '@annatarhe/lake-ui/empty-state'
import { Mail, MailWarning } from 'lucide-react'
import type { Metadata } from 'next'

import Callout from '@/components/layout/callout'
import CopyBlock from '@/components/settings/copy-block'
import { SettingsSection } from '@/components/settings/settings-section'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewer } from '@/server/data/viewer'
import {
  listEmailBindings,
  MAX_EMAIL_BINDINGS,
} from '@/server/email-import/bindings'
import { getServerEnv } from '@/server/env'

import AddEmailBinding from './add-email-binding'
import EmailBindingList from './email-binding-list'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('email.title') })
}

export default async function EmailImportSettingsPage() {
  const [viewer, { t }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'settings'),
  ])
  const bindings = await listEmailBindings(viewer.id)
  const inbound = getServerEnv().INBOUND_EMAIL_ADDRESS

  return (
    <>
      <SettingsSection
        title={t('email.title')}
        description={t('email.description')}
      >
        <div className="flex flex-col gap-6">
          {inbound ? (
            <CopyBlock label={t('email.address')} value={inbound} />
          ) : (
            <Callout
              tone="warning"
              icon={<MailWarning />}
              title={t('email.notConfiguredTitle')}
              description={t('email.notConfiguredDescription')}
            />
          )}
          <div className="flex flex-col gap-2">
            <h3 className="type-body text-lake-fg font-medium">
              {t('email.stepsTitle')}
            </h3>
            <ol className="text-lake-fg-muted flex list-decimal flex-col gap-1 pl-5 text-sm">
              <li>{t('email.step1')}</li>
              <li>{t('email.step2')}</li>
              <li>{t('email.step3')}</li>
            </ol>
          </div>
        </div>
      </SettingsSection>
      <SettingsSection
        title={t('email.bindings.title')}
        description={t('email.bindings.description', {
          max: MAX_EMAIL_BINDINGS,
        })}
        actions={
          <div className="flex items-center gap-3">
            <span className="type-meta">
              {t('email.bindings.count', {
                count: bindings.length,
                max: MAX_EMAIL_BINDINGS,
              })}
            </span>
            <AddEmailBinding
              max={MAX_EMAIL_BINDINGS}
              disabled={bindings.length >= MAX_EMAIL_BINDINGS}
            />
          </div>
        }
      >
        {bindings.length ? (
          <EmailBindingList bindings={bindings} max={MAX_EMAIL_BINDINGS} />
        ) : (
          <EmptyState
            icon={<Mail className="size-6" />}
            title={t('email.bindings.emptyTitle')}
            description={t('email.bindings.emptyDescription')}
          />
        )}
      </SettingsSection>
    </>
  )
}
