import type React from 'react'
import { Suspense } from 'react'

import GlobalUpload from '@/components/uploads/global'
import { getTranslation } from '@/i18n'
import { dashHref } from '@/utils/profile.utils'

import AppFooter from './app-footer'
import AppTopBar from './app-top-bar'
import MobileTabBar from './mobile-tab-bar'
import type { ShellViewer } from './types'

type AppShellProps = {
  /** Streamed: the session lookup must not hold up the page content. */
  viewer: Promise<ShellViewer | null>
  children: React.ReactNode
}

async function ViewerTopBar({ viewer }: Pick<AppShellProps, 'viewer'>) {
  return <AppTopBar viewer={await viewer} />
}

async function ViewerExtras({ viewer }: Pick<AppShellProps, 'viewer'>) {
  const resolved = await viewer
  if (!resolved) return null
  return (
    <>
      {/* room for the fixed tab bar, which only signed-in readers get */}
      <div
        aria-hidden="true"
        className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden"
      />
      <MobileTabBar viewer={resolved} />
      <GlobalUpload libraryHref={dashHref(resolved.slug, 'home')} />
    </>
  )
}

async function SkipLink() {
  const { t } = await getTranslation(undefined, 'common')
  return (
    <a
      href="#main"
      data-ui-scale="standard"
      className="rounded-lake-control bg-lake-surface-raised text-lake-fg shadow-lake-overlay sr-only z-50 px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {t('shell.skipToContent')}
    </a>
  )
}

/** The top bar's footprint while the viewer resolves, so nothing shifts. */
function TopBarPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="border-lake-line bg-lake-canvas sticky top-0 z-20 h-14 border-b"
    />
  )
}

function AppShell({ viewer, children }: AppShellProps) {
  return (
    <div className="bg-lake-canvas text-lake-fg flex min-h-dvh flex-col">
      <Suspense fallback={null}>
        <SkipLink />
      </Suspense>
      <Suspense fallback={<TopBarPlaceholder />}>
        <ViewerTopBar viewer={viewer} />
      </Suspense>
      <main id="main" className="app-main flex flex-1 flex-col">
        {children}
      </main>
      <Suspense fallback={null}>
        <AppFooter />
      </Suspense>
      <Suspense fallback={null}>
        <ViewerExtras viewer={viewer} />
      </Suspense>
    </div>
  )
}

export default AppShell
