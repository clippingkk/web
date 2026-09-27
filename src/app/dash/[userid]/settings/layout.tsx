import type React from 'react'

import Page from '@/components/layout/page'
import PageHeader from '@/components/layout/page-header'
import SettingsNav from '@/components/settings/settings-nav'
import { getTranslation } from '@/i18n'
import { currentPath } from '@/server/data/current-path'
import { requireViewerRoute } from '@/server/data/path-user'
import { getUserSlug } from '@/utils/profile.utils'

type SettingsLayoutProps = {
  children: React.ReactNode
  params: Promise<{ userid: string }>
}

/** `/dash/x/settings/orders?y` → `settings/orders` plus its search. */
function subpathOf(path: string, userid: string) {
  const prefix = `/dash/${userid}/`
  const [pathname, search = ''] = path.split('?')
  const rest = decodeURIComponent(pathname).startsWith(
    decodeURIComponent(prefix)
  )
    ? pathname.slice(prefix.length)
    : 'settings/web'
  return { subpath: rest || 'settings/web', search: search ? `?${search}` : '' }
}

async function SettingsLayout({ children, params }: SettingsLayoutProps) {
  const { userid } = await params
  const { subpath, search } = subpathOf(await currentPath(), userid)
  const [viewer, { t }] = await Promise.all([
    requireViewerRoute(userid, subpath, search),
    getTranslation(undefined, 'settings'),
  ])

  return (
    <Page width="default">
      <PageHeader title={t('title')} description={t('description')} />
      <div className="grid gap-8 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-12">
        <SettingsNav slug={getUserSlug(viewer)} />
        <div className="flex min-w-0 flex-col gap-10">{children}</div>
      </div>
    </Page>
  )
}

export default SettingsLayout
