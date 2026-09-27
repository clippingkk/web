'use client'

import ErrorState from '@/components/error-state/error-state'

export default function OrdersError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string }
  reset: () => void
  retry?: () => void
}) {
  return <ErrorState error={error} reset={retry ?? reset} variant="inline" />
}
