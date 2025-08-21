import { useMemo } from 'react'

export function useIsPremium(premiumEndAt?: string) {
  return useMemo(() => {
    if (!premiumEndAt) {
      return false
    }

    return new Date(premiumEndAt).getTime() > Date.now()
  }, [premiumEndAt])
}
