'use client'

import NavTabs from '@annatarhe/lake-ui/nav-tabs'
import NavbarContainer from '@annatarhe/lake-ui/navbar-container'
import Link from 'next/link'

import { useTranslation } from '@/i18n/client'

import Brand from './brand'
import { PRIMARY_NAV_ITEMS, shellHref } from './nav-items'
import SearchTrigger from './search-trigger'
import SignInButton from './sign-in-button'
import type { ShellViewer } from './types'
import { useActiveSegment } from './use-active-segment'
import UserMenu from './user-menu'

type AppTopBarProps = {
  viewer: ShellViewer | null
}

function AppTopBar({ viewer }: AppTopBarProps) {
  const { t } = useTranslation(undefined, 'common')
  const isActive = useActiveSegment(viewer)

  return (
    <NavbarContainer
      animated={false}
      data-ui-scale="standard"
      className="border-lake-line bg-lake-canvas/85 shadow-none backdrop-blur-sm"
      innerClassName="flex h-14 items-center gap-4 py-0 sm:gap-6"
    >
      <Brand href={viewer ? shellHref(viewer.slug, 'home') : '/'} />
      {viewer ? (
        <NavTabs
          aria-label={t('shell.nav.label')}
          variant="pill"
          className="hidden md:flex"
          items={PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return {
              key: item.key,
              label: t(`shell.nav.${item.key}`),
              icon: <Icon className="size-4" aria-hidden="true" />,
              active: isActive(item.segment),
              render: <Link href={shellHref(viewer.slug, item.segment)} />,
            }
          })}
        />
      ) : null}
      <div className="ml-auto flex items-center gap-2">
        {viewer ? (
          <>
            <SearchTrigger viewer={viewer} />
            <UserMenu viewer={viewer} />
          </>
        ) : (
          <SignInButton />
        )}
      </div>
    </NavbarContainer>
  )
}

export default AppTopBar
