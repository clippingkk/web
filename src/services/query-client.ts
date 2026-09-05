import { QueryClient } from '@tanstack/react-query'

export function getQueryGcTime(browserGcTime: number): number {
  // Finite GC timers retain request-scoped caches after SSR finishes.
  // Infinity disables those timers so unreachable caches can be collected.
  return typeof window === 'undefined' ? Infinity : browserGcTime
}

export function createReactQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60,
        gcTime: getQueryGcTime(5000),
      },
    },
  })
}
