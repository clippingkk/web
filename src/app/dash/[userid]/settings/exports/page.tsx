import type { Metadata } from 'next'

import { SettingsSection } from '@/components/settings/settings-section'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewer } from '@/server/data/viewer'

import ExportToFlomo from './export.flomo'
import ExportToMail from './export.mail'
import ExportToNotion from './export.notion'
import ExportToObsidian from './export.obsidian'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('exports.title') })
}

async function ExportsPage() {
  const [viewer, { t }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'settings'),
  ])
  return (
    <SettingsSection
      title={t('exports.title')}
      description={t('exports.description')}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExportToFlomo />
        <ExportToNotion />
        <ExportToMail email={viewer.email ?? ''} />
        <ExportToObsidian email={viewer.email ?? ''} />
      </div>
    </SettingsSection>
  )
}

export default ExportsPage
