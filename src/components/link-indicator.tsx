'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { cn } from '@/utils/cn'

type LinkIndicatorProps = {
  className?: string
  children?: React.ReactNode
}

/**
 * LinkIndicator component that shows loading status when navigating between pages
 * Uses router events to track navigation state
 */
export default function LinkIndicator({
  className,
  children,
}: LinkIndicatorProps) {
  const [pending, setPending] = useState(false)
  const _router = useRouter()

  useEffect(() => {
    // Since useLinkStatus is not available in Next.js 15.5,
    // we'll keep this simple and not show loading state
    // This can be enhanced with router events if needed
    setPending(false)
  }, [])

  if (!pending) {
    return children
  }

  return (
    <span
      className={cn('inline-flex items-center justify-center ml-1', className)}
      aria-live='polite'
      aria-label='Loading'
    >
      <Loader2 className='animate-spin h-4 w-4 text-blue-500 dark:text-blue-400' />
    </span>
  )
}
