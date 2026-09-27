'use client'

import { useLayoutEffect } from 'react'

import { syncThemeToDocument, useTheme } from './use-theme'

/**
 * The <head> boot script applies the theme before first paint. This keeps
 * <html> in sync afterwards: it re-applies after hydration and subscribes to
 * OS changes while the preference is `system`.
 */
function ThemeSync() {
  useTheme()
  useLayoutEffect(() => {
    syncThemeToDocument()
  }, [])
  return null
}

export default ThemeSync
