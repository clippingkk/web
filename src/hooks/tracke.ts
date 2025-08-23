'use client'
import { useCallback, useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePageTrack(_page: string, _params?: any) {
  // Tracking removed - no longer using mixpanel
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useActionTrack(_action: string, _params?: any) {
  return useCallback(() => {
    // Tracking removed - no longer using mixpanel
  }, [])
}
export function useTitle(title?: string) {
  useEffect(() => {
    if (!title) {
      return
    }
    const t = document.title
    document.title = `${title} - clippingkk`
    return () => {
      document.title = t
    }
  }, [title])
}
