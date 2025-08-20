'use client'

import { Loader2 } from 'lucide-react'
import { useLinkStatus } from 'next/link'

import { cn } from '@/utils/cn'

type LinkIndicatorProps = {
  className?: string
  children?: React.ReactNode
}

/**
 * LinkIndicator component that shows loading status when navigating between pages
 * Must be used inside a Next.js Link component
 */
export default function LinkIndicator({
  className,
  children,
}: LinkIndicatorProps) {
  const { pending } = useLinkStatus()

  if (!pending) {
    return children
  }

  return (
    <span
      className={cn('inline-flex items-center justify-center ml-1', className)}
      aria-live="polite"
      aria-label="Loading"
    >
      <Loader2 className="animate-spin h-4 w-4 text-blue-500 dark:text-blue-400" />
    </span>
  )
}
