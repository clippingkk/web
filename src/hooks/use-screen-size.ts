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
    return {
      width: isClient ? window.innerWidth : 0,
      height: isClient ? window.innerHeight : 0,
      screen: BreakPoint.s
    }
  }, [isClient])

  const [screenSize, setScreenSize] = useState(getSize)

  useEffect(() => {
    if (!isClient) {
      return
    }

    function handleResize () {
      setScreenSize(getSize())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (screenSize.width < 576) {
    screenSize.screen = BreakPoint.xs
  } else if (screenSize.width >= 576 && screenSize.width < 768) {
    screenSize.screen = BreakPoint.s
  } else if (screenSize.width >= 768 && screenSize.width < 992) {
    screenSize.screen = BreakPoint.m
  } else if (screenSize.width >= 992 && screenSize.width < 1200) {
    screenSize.screen = BreakPoint.l
  } else {
    screenSize.screen = BreakPoint.xl
  }

  return screenSize
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
  return masonaryColumnsMapping[s.screen]
}
