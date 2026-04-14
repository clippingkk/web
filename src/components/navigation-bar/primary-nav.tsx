'use client'

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'

import {
  PRIMARY_NAV_ITEM_ACTIVE_CLASSES,
  PRIMARY_NAV_ITEM_BASE_CLASSES,
  PRIMARY_NAV_ITEM_INACTIVE_CLASSES,
  PRIMARY_NAV_ITEMS,
  PRIMARY_NAV_LIST_CLASSES,
} from './constants'

type PrimaryNavItemProps = {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
}

function PrimaryNavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: PrimaryNavItemProps) {
  return (
    <Link
      href={href as any}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        PRIMARY_NAV_ITEM_BASE_CLASSES,
        isActive
          ? PRIMARY_NAV_ITEM_ACTIVE_CLASSES
          : PRIMARY_NAV_ITEM_INACTIVE_CLASSES
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}

type PrimaryNavProps = {
  profileSlug: string | number
}

function PrimaryNav({ profileSlug }: PrimaryNavProps) {
  const { t } = useTranslation(undefined, 'navigation')
  const activeSegment = useSelectedLayoutSegment()

  return (
    <ul className={PRIMARY_NAV_LIST_CLASSES}>
      {PRIMARY_NAV_ITEMS.map((item) => (
        <li key={item.i18nKey}>
          <PrimaryNavItem
            href={item.buildHref(profileSlug)}
            label={t(`app.menu.${item.i18nKey}`) ?? ''}
            icon={item.icon}
            isActive={activeSegment === item.targetSegment}
          />
        </li>
      ))}
    </ul>
  )
}

export default PrimaryNav
