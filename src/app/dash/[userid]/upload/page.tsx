import type { Metadata } from 'next'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewerRoute } from '@/server/data/path-user'
import { dashHref } from '@/utils/profile.utils'

import ImportHelp from './help'
import ImportPanel from './import-panel'

type PageProps = {
  params: Promise<{ userid: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'import')
  return pageMetadata({ title: t('meta.title') })
}

async function UploadPage(props: PageProps) {
  const { userid } = await props.params
  const [viewer, { t }] = await Promise.all([
    requireViewerRoute(userid, 'upload'),
    getTranslation(undefined, 'import'),
  ])
  return (
    <Page width="reading">
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <ImportPanel libraryHref={dashHref(viewer, 'home')} />
      <ImportHelp />
    </Page>
  )
}

export default UploadPage
