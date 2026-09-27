'use client'

import ErrorState from '@/components/error-state/error-state'

// Keeps failures inside the app shell, so navigation still works.
export default function DashError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string }
  reset: () => void
  retry?: () => void
}) {
  // Next 16 passes retry, which refetches the segment; reset only re-renders.
  return <ErrorState error={error} reset={retry ?? reset} variant="inline" />
}
