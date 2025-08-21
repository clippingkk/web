'use client'
import type React from 'react'
import { useEffect, useState } from 'react'

type HideUntilLoadedProps = {
  imageToLoad: string
  children: React.ReactElement
}

function HideUntilLoaded(props: HideUntilLoadedProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    const img = document.createElement('img')
    setLoaded(false)
    setErrored(false)
    img.onload = () => {
      setLoaded(true)
    }
    img.onerror = () => {
      setErrored(true)
    }
    img.src = props.imageToLoad
  }, [props.imageToLoad])
  if (errored) {
    return props.children
  }

  if (!loaded && process.browser) {
    return null
  }

  return props.children
}

export default HideUntilLoaded
