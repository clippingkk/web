import type React from 'react'

import GlobalUpload from '@/components/uploads/global'
import { getTranslation } from '@/i18n'
import { dashHref } from '@/utils/profile.utils'

import AppFooter from './app-footer'
import AppTopBar from './app-top-bar'
import MobileTabBar from './mobile-tab-bar'
import type { ShellViewer } from './types'

type AppShellProps = {
  viewer: ShellViewer | null
  children: React.ReactNode
}

async function AppShell({ viewer, children }: AppShellProps) {
  const { t } = await getTranslation(undefined, 'common')
  return (
    <div className="bg-lake-canvas text-lake-fg flex min-h-dvh flex-col">
      <a
        href="#main"
        data-ui-scale="standard"
        className="rounded-lake-control bg-lake-surface-raised text-lake-fg shadow-lake-overlay sr-only z-50 px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('shell.skipToContent')}
      </a>
      <AppTopBar viewer={viewer} />
      <main
        id="main"
        className={`app-main flex flex-1 flex-col ${viewer ? 'pb-20 md:pb-0' : ''}`}
      >
        {children}
      </main>
      <AppFooter />
      {viewer ? <MobileTabBar viewer={viewer} /> : null}
      {viewer ? (
        <GlobalUpload libraryHref={dashHref(viewer.slug, 'home')} />
      ) : null}
    </div>
  )
}

export default AppShell
