'use client'
import mixpanel from 'mixpanel-browser'
import { useCallback, useEffect } from 'react'

const __DEV__ = process.env.NODE_ENV !== 'production'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePageTrack(page: string, params?: any) {
  useEffect(() => {
    if (__DEV__) {
      return
    }
    mixpanel.track(`pv:in:${page}`, {
      ...(params || {}),
    })
    return () => {
      mixpanel.track(`pv:out:${page}`)
    }
  }, [page, params])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useActionTrack(action: string, params?: any) {
  return useCallback(() => {
    if (__DEV__) {
      return
    }
    mixpanel.track(`action:${action}`, params)
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
