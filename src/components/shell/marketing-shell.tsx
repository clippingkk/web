import Button from '@annatarhe/lake-ui/button'
import NavbarContainer from '@annatarhe/lake-ui/navbar-container'
import Link from 'next/link'
import type React from 'react'

import { getTranslation } from '@/i18n'
import { getViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

import AppFooter from './app-footer'
import Brand from './brand'
import SignInButton from './sign-in-button'

type MarketingShellProps = {
  children: React.ReactNode
}

/** Chrome for public pages: landing, pricing, payment, policy, reports. */
async function MarketingShell({ children }: MarketingShellProps) {
  const [viewer, { t }] = await Promise.all([
    getViewer(),
    getTranslation(undefined, 'common'),
  ])
  return (
    <div className="bg-lake-canvas text-lake-fg flex min-h-dvh flex-col">
      <NavbarContainer
        animated={false}
        data-ui-scale="standard"
        className="border-lake-line bg-lake-canvas/85 shadow-none backdrop-blur-sm"
        innerClassName="flex h-14 items-center gap-4 py-0 sm:gap-6"
      >
        <Brand href="/" />
        <nav aria-label={t('shell.nav.label')} className="flex items-center">
          <Link
            href="/pricing"
            className="rounded-lake-control text-lake-fg-muted hover:text-lake-fg focus-visible:ring-lake-ring px-2 py-1.5 text-sm transition-colors duration-150 outline-none focus-visible:ring-2"
          >
            {t('shell.footer.pricing')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {viewer ? (
            <Button
              size="sm"
              variant="primary"
              render={<Link href={dashHref(viewer.slug, 'home')} />}
            >
              {t('shell.openLibrary')}
            </Button>
          ) : (
            <SignInButton />
          )}
        </div>
      </NavbarContainer>
      <main id="main" className="app-main flex flex-1 flex-col">
        {children}
      </main>
      <AppFooter />
    </div>
  )
}

export default MarketingShell
