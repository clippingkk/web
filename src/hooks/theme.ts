import { useState, useEffect, useCallback } from "react"
import { bgs } from "./theme.config"

const darkModeClassName = 'dark'

export function useDarkModeStatus() {
  const [is, setIs] = useState(false)
  useEffect(() => {
    const isDarkTheme = document.querySelector('html')?.classList.contains(darkModeClassName)
    setIs(isDarkTheme ?? false)
  }, [])
  const onDarkThemeChange = useCallback((v: boolean) => {
    const html = document.querySelector('html')
    if (html?.classList.contains(darkModeClassName)) {
      html?.classList.remove(darkModeClassName)
    } else {
      html?.classList.add(darkModeClassName)
    }
    setIs(v)
  }, [])

  return {
    isDarkTheme: is,
    onDarkThemeChange
  }
}

export function useBackgroundImage() {
  const [bgIdx, setBgIdx] = useState(0)
  useEffect(() => {
    setBgIdx(Math.floor(Math.random() * bgs.length))
  }, [])
  return bgs[bgIdx]
}
