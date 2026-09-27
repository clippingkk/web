import Cookies from 'js-cookie'
import { useCallback, useSyncExternalStore } from 'react'

import { STORAGE_THEME_KEY } from '@/constants/storage'
import {
  applyResolvedTheme,
  DEFAULT_THEME,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  SERVER_THEME,
  type ThemePreference,
} from '@/lib/theme'

type ThemeSnapshot = {
  preference: ThemePreference
  resolved: ResolvedTheme
}

const DARK_QUERY = '(prefers-color-scheme: dark)'
const SERVER_SNAPSHOT: ThemeSnapshot = {
  preference: DEFAULT_THEME,
  resolved: SERVER_THEME,
}

const listeners = new Set<() => void>()
let snapshot: ThemeSnapshot | null = null
let media: MediaQueryList | null = null

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

function onSystemChange() {
  if (getSnapshot().preference === 'system') emit(compute('system'))
}

// One OS listener for the whole store, however many components use the hook.
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    media = window.matchMedia?.(DARK_QUERY) ?? null
    media?.addEventListener('change', onSystemChange)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      media?.removeEventListener('change', onSystemChange)
      media = null
    }
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
