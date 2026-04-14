import type React from 'react'

import { cn } from '@/lib/utils'

type SurfaceVariant = 'default' | 'muted' | 'elevated' | 'plain'

type SurfaceProps<T extends React.ElementType> = {
  as?: T
  variant?: SurfaceVariant
  className?: string
  children?: React.ReactNode
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'variant' | 'className' | 'children'
>

const variantClasses: Record<SurfaceVariant, string> = {
  default:
    'rounded-2xl border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-900/70',
  muted:
    'rounded-2xl border border-white/30 bg-white/50 backdrop-blur-lg dark:border-slate-800/30 dark:bg-slate-900/50',
  elevated:
    'rounded-2xl border border-white/50 bg-white/80 shadow-[0_10px_30px_-12px_rgba(59,130,246,0.25)] backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/80 dark:shadow-[0_10px_30px_-12px_rgba(59,130,246,0.4)]',
  plain:
    'rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-slate-900',
}

/**
 * Surface — the canonical glass card wrapper.
 *
 * Use for every boxed/card container in the app (pages, modals, settings
 * sections, empty states). Variants:
 *   - `default`   — standard glass surface (most common)
 *   - `muted`     — lighter translucency, for nested surfaces
 *   - `elevated`  — subtle blue-toned shadow, for hero / CTA cards
 *   - `plain`     — opaque, for dense content like prose/tables
 */
function Surface<T extends React.ElementType = 'div'>({
  as,
  variant = 'default',
  className,
  children,
  ...rest
}: SurfaceProps<T>) {
  const Component = (as ?? 'div') as React.ElementType
  return (
    <Component className={cn(variantClasses[variant], className)} {...rest}>
      {children}
    </Component>
  )
}

export default Surface
export type { SurfaceVariant }
