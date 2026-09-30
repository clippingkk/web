'use client'

import NavTabs from '@annatarhe/lake-ui/nav-tabs'
import {
  CreditCard,
  FileDown,
  type LucideIcon,
  PlugZap,
  SlidersHorizontal,
  UserRound,
  Webhook,
} from 'lucide-react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { dashHref } from '@/utils/profile.utils'

const SECTIONS: {
  key: 'web' | 'orders' | 'webhooks' | 'mcp' | 'exports' | 'account'
  icon: LucideIcon
}[] = [
  { key: 'web', icon: SlidersHorizontal },
  { key: 'orders', icon: CreditCard },
  { key: 'webhooks', icon: Webhook },
  { key: 'mcp', icon: PlugZap },
  { key: 'exports', icon: FileDown },
  { key: 'account', icon: UserRound },
]

type SettingsNavProps = {
  slug: string
}

/** A rail on desktop, a scrolling tab strip on mobile. */
function SettingsNav({ slug }: SettingsNavProps) {
  const { t } = useTranslation(undefined, 'settings')
  const segment = useSelectedLayoutSegment() ?? 'web'

  return (
    <>
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:hidden">
        <NavTabs
          aria-label={t('nav.label')}
          variant="pill"
          items={SECTIONS.map(({ key, icon: Icon }) => ({
            key,
            label: t(`nav.${key}`),
            icon: <Icon className="size-4" aria-hidden="true" />,
            active: segment === key,
            render: <Link href={dashHref(slug, `settings/${key}`)} />,
          }))}
        />
      </div>
      <nav aria-label={t('nav.label')} className="hidden md:block">
        <ul className="sticky top-20 flex flex-col gap-1">
          {SECTIONS.map(({ key, icon: Icon }) => {
            const active = segment === key
            return (
              <li key={key}>
                <Link
                  href={dashHref(slug, `settings/${key}`)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-lake-control flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-lake-ring',
                    active
                      ? 'bg-lake-surface-muted text-lake-fg font-medium'
                      : 'text-lake-fg-muted hover:bg-lake-surface-muted/60 hover:text-lake-fg'
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {t(`nav.${key}`)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

export default SettingsNav
