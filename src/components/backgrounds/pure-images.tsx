'use client'

import { useEffect, useMemo, useState } from 'react'

type PureImagesProps = {
  width?: number | string
  height?: number | string
  lightingColor:
    | string
    | {
        light: string
        dark: string
      }
}

function PureImages(props: PureImagesProps) {
  const { lightingColor, width = '100vw', height = '100vh' } = props
  // Initialize with actual dark mode status (only runs on client due to 'use client')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.body.classList.contains('dark')
    }
    return false
  })

  useEffect(() => {
    // Set up an observer to detect changes to the body class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.body.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.body, { attributes: true })

    return () => observer.disconnect()
  }, [])
  const lightingColorValue = useMemo(() => {
    if (typeof lightingColor === 'string') {
      return lightingColor
    }
    return isDarkMode ? lightingColor.dark : lightingColor.light
  }, [isDarkMode, lightingColor])
  return (
    <svg width={width} height={height}>
      <filter id='surface'>
        <feTurbulence
          type='fractalNoise'
          baseFrequency='.95 .95'
          numOctaves='80'
          result='noise'
        />
        <feDiffuseLighting
          in='noise'
          lightingColor={lightingColorValue}
          surfaceScale='.8'
          result='grind'
        >
          <feDistantLight azimuth='500' elevation='50' />
        </feDiffuseLighting>
        <feGaussianBlur in='grind' stdDeviation='.5' />
      </filter>
      <rect width={width} height={height} filter='url(#surface)' />
    </svg>
  )
}

export default PureImages
