import { useState, useEffect, useCallback } from "react"

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

const bgs = [
  'https://ck-cdn.annatarhe.cn/lrYm87HbNXn7rU1vBdh4iC7dXUGB8St2/DSCF1642.jpg',
  'https://ck-cdn.annatarhe.cn/k0eLe3mUbrMrYqJw9HPFDmSWIBqmnLpX/DSCF1611.jpg',
  'https://ck-cdn.annatarhe.cn/UmzmeThtEhYvVewG5TkBmS8IEGiAGSwI/DSCF1609.jpg',
  'https://ck-cdn.annatarhe.cn/nwTvnaDfnzGR4axGYCMQ9my0Sq2MGk0c/DSCF1575.jpg',
  'https://ck-cdn.annatarhe.cn/aRHhsYQI9hg6aqDhFvAEiqyi1gJzJnca/DSCF1310.jpg',
  'https://ck-cdn.annatarhe.cn/41me0rLT3nU4pdv9PdSMSNPR2acAvbQ4/DSCF1109.jpg',
  'https://ck-cdn.annatarhe.cn/RhcWMEhdl9h6hJD7kO9UNN8mzIFDKRva/DSCF1069-HDR.jpg',
  // 'coffee-blur.jpg',
]

export function useBackgroundImage() {
  const [bgIdx, setBgIdx] = useState(0)
  useEffect(() => {
    setBgIdx(Math.floor(Math.random() * bgs.length))
  }, [])
  return bgs[bgIdx]
}
