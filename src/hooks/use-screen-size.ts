// fork from: https://github.com/kingflamez/use-screen-size/blob/master/src/index.tsx
import { useState, useEffect, useCallback } from 'react'

enum BreakPoint {
  xs = 'xs',
  s = 's',
  m = 'm',
  l = 'l',
  xl = 'xl'
}

// Screen Size Hook
export default function useScreenSize() {
  const isClient = typeof window === 'object'

  const getSize = useCallback(() => {
    const result = {
      width: isClient ? window.innerWidth : 0,
      height: isClient ? window.innerHeight : 0,
      screen: BreakPoint.s
    }
    if (result.width < 576) {
      result.screen = BreakPoint.xs
    } else if (result.width >= 576 && result.width < 768) {
      result.screen = BreakPoint.s
    } else if (result.width >= 768 && result.width < 992) {
      result.screen = BreakPoint.m
    } else if (result.width >= 992 && result.width < 1200) {
      result.screen = BreakPoint.l
    } else {
      result.screen = BreakPoint.xl
    }

    return result
  }, [isClient])

  const [size, setSize] = useState<BreakPoint>(BreakPoint.s)

  useEffect(() => {
    if (!isClient) {
      return
    }

    function handleResize () {
      setSize(getSize().screen)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

const masonaryColumnsMapping = {
  [BreakPoint.xs]: 1,
  [BreakPoint.s]: 1,
  [BreakPoint.m]: 2,
  [BreakPoint.l]: 3,
  [BreakPoint.xl]: 3
}

export function useMasonaryColumnCount() {
  const s = useScreenSize()
  return masonaryColumnsMapping[s]
}
