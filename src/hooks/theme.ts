'use client'
import { useState, useEffect } from 'react'
import { bgs } from './theme.config'
import { localStorageColorSchemeManager, useMantineColorScheme } from '@mantine/core'

const darkModeClassName = 'dark'

export const colorSchemeManager = localStorageColorSchemeManager({ key: 'ck-color-scheme' })

export function useDarkModeStatus() {
  const { colorScheme } = useMantineColorScheme()
  useEffect(() => {
    if (colorScheme === 'dark') {
      document.querySelector('html')?.classList.add(darkModeClassName)
    }
    if (colorScheme === 'light') {
      document.querySelector('html')?.classList.remove(darkModeClassName)
    }
  }, [colorScheme])
}

export function useBackgroundImage() {
  const [bgIdx, setBgIdx] = useState(0)
  useEffect(() => {
    setBgIdx(Math.floor(Math.random() * bgs.length))
  }, [])
  return bgs[bgIdx]
}
