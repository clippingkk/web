'use client'
import { useCallback, useEffect } from 'react'

const __DEV__ = process.env.NODE_ENV !== 'production'

 
export function usePageTrack(page: string, params?: any) {
  useEffect(() => {
    // No-op
  }, [page, params])
}

 
export function useActionTrack(action: string, params?: any) {
  return useCallback(() => {
    // No-op
  }, [action, params])
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
