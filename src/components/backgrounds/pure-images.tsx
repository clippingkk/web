'use client'

import { useColorScheme } from '@mantine/hooks'
import React, { useMemo } from 'react'

type PureImagesProps = {
  width?: number | string
  height?: number | string
  lightingColor: string | {
    light: string
    dark: string
  }
}

function PureImages(props: PureImagesProps) {
  const { lightingColor, width = '100vw', height = '100vh' } = props
  const colorScheme = useColorScheme()
  const lightingColorValue = useMemo(() => {
    if (typeof lightingColor === 'string') {
      return lightingColor
    }
    return colorScheme === 'dark' ? lightingColor.dark : lightingColor.light
  }, [colorScheme, lightingColor])
  return (
    <svg width={width} height={height}>
      <filter id="surface">
        <feTurbulence type="fractalNoise" baseFrequency='.95 .95' numOctaves="80" result='noise' />
        <feDiffuseLighting in='noise' lightingColor={lightingColorValue} surfaceScale='.8' result="grind">
          <feDistantLight azimuth='500' elevation='50' />
        </feDiffuseLighting>
        <feGaussianBlur in="grind" stdDeviation=".5" />
      </filter>
      <rect width={width} height={height} filter="url(#surface)" />
    </svg>
  )
}

export default PureImages
