import type React from 'react'

import { cn } from '@/lib/utils'

const widths = {
  reading: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
} as const

type PageProps = {
  width?: keyof typeof widths
  className?: string
  children: React.ReactNode
}

/** The root of every route: reading, default or wide measure. */
function Page({ width = 'default', className, children }: PageProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col gap-10 px-4 py-8 sm:px-6 md:py-12',
        widths[width],
        className
      )}
    >
      {children}
    </div>
  )
}

export default Page
