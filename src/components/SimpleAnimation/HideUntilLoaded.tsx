'use client'
import type React from 'react'
import { useEffect, useState } from 'react'

type HideUntilLoadedProps = {
  imageToLoad: string
  children: React.ReactElement
}

// Inner component that resets via key prop when imageToLoad changes
function HideUntilLoadedInner({
  imageToLoad,
  children,
}: HideUntilLoadedProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  )

  useEffect(() => {
    const img = document.createElement('img')
    img.onload = () => setStatus('loaded')
    img.onerror = () => setStatus('error')
    img.src = imageToLoad

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageToLoad])

  if (status === 'error') {
    return children
  }

  if (status === 'loading') {
    return null
  }

  return children
}

function HideUntilLoaded(props: HideUntilLoadedProps) {
  // Use key prop to reset component state when imageToLoad changes
  return <HideUntilLoadedInner key={props.imageToLoad} {...props} />
}

export default HideUntilLoaded
