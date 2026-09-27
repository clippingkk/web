import type { Metadata } from 'next'
import type React from 'react'
import { Suspense } from 'react'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import SettingsNav from '@/components/settings/settings-nav'
import SettingsSkeleton from '@/components/settings/settings-skeleton'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { currentPath, dashSubpath } from '@/server/data/current-path'
import { requireViewerRoute } from '@/server/data/path-user'
import { getUserSlug } from '@/utils/profile.utils'

type SettingsLayoutProps = {
  children: React.ReactNode
  params: Promise<{ userid: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'settings')
  return pageMetadata({ title: t('meta.title') })
}

async function SettingsFrame({ children, params }: SettingsLayoutProps) {
  const { userid } = await params
  const { subpath, search } = dashSubpath(
    await currentPath(),
    userid,
    'settings/web'
  )
  const [viewer, { t }] = await Promise.all([
    requireViewerRoute(userid, subpath, search),
    getTranslation(undefined, 'settings'),
  ])

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <div className="grid gap-8 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-12">
        <SettingsNav slug={getUserSlug(viewer)} />
        <div className="flex min-w-0 flex-col gap-10">{children}</div>
      </div>
    </>
  )
}

function SettingsLayout(props: SettingsLayoutProps) {
  return (
    <Page width="default">
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsFrame {...props} />
      </Suspense>
    </Page>
  )
}

export default SettingsLayout
