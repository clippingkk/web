'use client'

import ErrorState from '@/components/error-state/error-state'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState error={error} reset={reset} variant="page" />
}
