import {
  BookOpen,
  LayoutGrid,
  type LucideIcon,
  Upload,
  UserRound,
} from 'lucide-react'
import type { Route } from 'next'

export type ShellNavSegment = 'home' | 'square' | 'upload' | 'profile'

export type ShellNavItem = {
  key: 'library' | 'square' | 'upload' | 'me'
  icon: LucideIcon
  segment: ShellNavSegment
}

export const PRIMARY_NAV_ITEMS: readonly ShellNavItem[] = [
  { key: 'library', icon: BookOpen, segment: 'home' },
  { key: 'square', icon: LayoutGrid, segment: 'square' },
  { key: 'upload', icon: Upload, segment: 'upload' },
]

export const MOBILE_NAV_ITEMS: readonly ShellNavItem[] = [
  ...PRIMARY_NAV_ITEMS,
  { key: 'me', icon: UserRound, segment: 'profile' },
]

export function shellHref(slug: string, segment: ShellNavSegment): Route {
  return `/dash/${slug}/${segment}` as Route
}
