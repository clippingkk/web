import type React from 'react'

import { cn } from '@/lib/utils'

type PageShellWidth = 'narrow' | 'default' | 'wide' | 'full'

type PageShellProps = {
  className?: string
  contentClassName?: string
  width?: PageShellWidth
  animated?: boolean
  children: React.ReactNode
}

const widthClasses: Record<PageShellWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
}

/**
 * PageShell — consistent server-side page wrapper.
 *
 * Provides responsive padding, a controlled max-width column, and a gentle
 * slide-in entrance so every route has the same rhythm. Place this at the
 * root of any server `page.tsx` that is NOT already wrapped in a shell
 * (DashboardContainer already handles container width for /dash routes;
 * in those cases prefer `width="full"` or skip PageShell).
 */
function PageShell({
  className,
  contentClassName,
  width = 'default',
  animated = true,
  children,
}: PageShellProps) {
  return (
    <section
      className={cn(
        'w-full px-4 py-8 md:px-6 md:py-12',
        animated && 'with-slide-in',
        className
      )}
    >
      <div
        className={cn('mx-auto w-full', widthClasses[width], contentClassName)}
      >
        {children}
      </div>
    </section>
  )
}

export default PageShell
