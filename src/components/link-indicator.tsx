'use client'

import { cn } from '@/utils/cn'

type LinkIndicatorProps = {
  className?: string
  children?: React.ReactNode
}

/**
 * LinkIndicator component that shows loading status when navigating between pages
 * Note: Currently just renders children since useLinkStatus is not available in Next.js 15.5
 */
export default function LinkIndicator({
  children,
}: LinkIndicatorProps) {
  // Since useLinkStatus is not available in Next.js 15.5,
  // we just render children directly without loading state
  return children
}
