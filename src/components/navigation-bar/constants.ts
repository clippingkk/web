import { BookOpen, LayoutGrid, type LucideIcon, Upload } from 'lucide-react'

export type PrimaryNavI18nKey = 'read' | 'square' | 'upload'
export type PrimaryNavSegment = 'home' | 'square' | 'upload'

export type PrimaryNavItem = {
  icon: LucideIcon
  i18nKey: PrimaryNavI18nKey
  targetSegment: PrimaryNavSegment
  buildHref: (slug: string | number) => string
}

export function buildDashPath(
  slug: string | number,
  segment: PrimaryNavSegment
): string {
  return `/dash/${slug}/${segment}`
}

export const PRIMARY_NAV_ITEMS: readonly PrimaryNavItem[] = [
  {
    icon: BookOpen,
    i18nKey: 'read',
    targetSegment: 'home',
    buildHref: (slug) => buildDashPath(slug, 'home'),
  },
  {
    icon: LayoutGrid,
    i18nKey: 'square',
    targetSegment: 'square',
    buildHref: (slug) => buildDashPath(slug, 'square'),
  },
  {
    icon: Upload,
    i18nKey: 'upload',
    targetSegment: 'upload',
    buildHref: (slug) => buildDashPath(slug, 'upload'),
  },
] as const

export const NAV_SHELL_CLASSES =
  'sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/92'

export const NAV_INNER_CLASSES =
  'mx-auto flex w-full max-w-7xl flex-col items-stretch gap-2 px-4 py-2 sm:flex-row sm:items-center sm:gap-4'

export const NAV_LEFT_ZONE_CLASSES =
  'flex items-center justify-between gap-3 sm:flex-1 sm:basis-0 sm:justify-start'

export const NAV_RIGHT_ZONE_CLASSES =
  'flex items-center sm:flex-1 sm:basis-0 sm:justify-end'

export const PRIMARY_NAV_LIST_CLASSES =
  'flex items-center justify-center gap-1 sm:gap-1.5'

export const PRIMARY_NAV_ITEM_BASE_CLASSES =
  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none sm:px-3.5'

export const PRIMARY_NAV_ITEM_ACTIVE_CLASSES =
  'bg-blue-400/10 text-blue-500 ring-1 ring-inset ring-blue-400/20 dark:bg-blue-400/15 dark:text-blue-300'

export const PRIMARY_NAV_ITEM_INACTIVE_CLASSES =
  'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
