import { useEffect } from 'react'

export function useScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])
}
