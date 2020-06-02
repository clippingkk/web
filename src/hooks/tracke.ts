import { useEffect, useCallback } from "react";
import mixpanel from "mixpanel-browser";

export function usePageTrack(page: string, params?: any) {
  useEffect(() => {
    mixpanel.track('pv:in', {
      page,
      ...(params || {})
    })
    return () => {
      mixpanel.track('pv:out', {
        page
      })
    }
  }, [page, params])
}

export function useActionTrack(action: string, params?: any) {
  return useCallback(() => {
    mixpanel.track('action:' + action, params)
  }, [action, params])
}
