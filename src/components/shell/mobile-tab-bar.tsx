'use client'

import Link from 'next/link'

import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'

import { MOBILE_NAV_ITEMS, shellHref } from './nav-items'
import type { ShellViewer } from './types'
import { useActiveSegment } from './use-active-segment'

type MobileTabBarProps = {
  viewer: ShellViewer
}

function MobileTabBar({ viewer }: MobileTabBarProps) {
  const { t } = useTranslation(undefined, 'common')
  const isActive = useActiveSegment(viewer)

  return (
    <nav
      aria-label={t('shell.nav.label')}
      data-ui-scale="standard"
      className="border-lake-line bg-lake-canvas/90 fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.segment)
          return (
            <li key={item.key}>
              <Link
                href={shellHref(viewer.slug, item.segment)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 text-[0.6875rem] font-medium transition-colors duration-150 outline-none focus-visible:bg-lake-surface-muted',
                  active
                    ? 'text-lake-accent-text'
                    : 'text-lake-fg-subtle hover:text-lake-fg'
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {t(`shell.nav.${item.key}`)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default MobileTabBar
