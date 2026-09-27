'use client'

import ErrorState from '@/components/error-state/error-state'

export default function ErrorPage({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string }
  reset: () => void
  /** Next 16.3+: re-fetches the segment instead of only re-rendering it. */
  retry?: () => void
}) {
  return <ErrorState error={error} reset={retry ?? reset} variant="page" />
}
