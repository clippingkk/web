import Cookies from 'js-cookie'
import { useCallback, useSyncExternalStore } from 'react'

import { STORAGE_THEME_KEY } from '@/constants/storage'
import {
  applyResolvedTheme,
  DEFAULT_THEME,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme'

type ThemeSnapshot = {
  preference: ThemePreference
  resolved: ResolvedTheme
}

const DARK_QUERY = '(prefers-color-scheme: dark)'
const SERVER_SNAPSHOT: ThemeSnapshot = {
  preference: DEFAULT_THEME,
  resolved: resolveTheme(DEFAULT_THEME, true),
}

const listeners = new Set<() => void>()
let snapshot: ThemeSnapshot | null = null

function systemPrefersDark() {
  return window.matchMedia?.(DARK_QUERY).matches ?? false
}

function readPreference(): ThemePreference {
  const stored = Cookies.get(STORAGE_THEME_KEY)
  return isThemePreference(stored) ? stored : DEFAULT_THEME
}

function compute(preference: ThemePreference): ThemeSnapshot {
  return { preference, resolved: resolveTheme(preference, systemPrefersDark()) }
}

function emit(next: ThemeSnapshot) {
  snapshot = next
  applyResolvedTheme(next.resolved)
  for (const listener of listeners) listener()
}

function getSnapshot(): ThemeSnapshot {
  if (!snapshot) snapshot = compute(readPreference())
  return snapshot
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const media = window.matchMedia?.(DARK_QUERY)
  const onSystemChange = () => {
    const current = getSnapshot()
    if (current.preference === 'system') emit(compute('system'))
  }
  media?.addEventListener('change', onSystemChange)
  return () => {
    listeners.delete(listener)
    media?.removeEventListener('change', onSystemChange)
  }
}

export function setThemePreference(preference: ThemePreference) {
  Cookies.set(STORAGE_THEME_KEY, preference, {
    expires: 365,
    sameSite: 'lax',
    path: '/',
  })
  emit(compute(preference))
}

/** Re-applies the stored theme to <html>, e.g. after a StrictMode remount. */
export function syncThemeToDocument() {
  emit(compute(readPreference()))
}

export function useTheme() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_SNAPSHOT
  )
  const setPreference = useCallback(
    (preference: ThemePreference) => setThemePreference(preference),
    []
  )
  return { ...current, setPreference }
}
