import { useEffect } from 'react'

function syncPointer({ x, y }: PointerEvent) {
  document.documentElement.style.setProperty('--pointer-x', x.toFixed(2))
  document.documentElement.style.setProperty(
    '--pointer-xp',
    (x / window.innerWidth).toFixed(2)
  )
  document.documentElement.style.setProperty('--pointer-y', y.toFixed(2))
  document.documentElement.style.setProperty(
    '--pointer-yp',
    (y / window.innerHeight).toFixed(2)
  )
}

// https://codepen.io/jh3y/pen/oNVvQRo
export function usePointerUpdate() {
  useEffect(() => {
    // if (isTouchDevice()) {
    //   return
    // }
    document.body.addEventListener('pointermove', syncPointer)
    return () => {
      document.body.removeEventListener('pointermove', syncPointer)
    }
  }, [])
}
