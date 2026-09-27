import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STORAGE_THEME_KEY } from '@/constants/storage'
import { DEFAULT_THEME } from '@/lib/theme'

type UseThemeModule = typeof import('../use-theme')

function fakeMatchMedia(prefersDark: boolean) {
  const listeners = new Set<() => void>()
  const media = {
    matches: prefersDark,
    addEventListener: vi.fn((_: string, fn: () => void) => listeners.add(fn)),
    removeEventListener: vi.fn((_: string, fn: () => void) =>
      listeners.delete(fn)
    ),
  }
  window.matchMedia = vi.fn(() => media as unknown as MediaQueryList)
  return {
    media,
    listeners,
    setPrefersDark(dark: boolean) {
      media.matches = dark
      for (const fn of listeners) fn()
    },
  }
}

function storeTheme(value: string) {
  document.cookie = `${STORAGE_THEME_KEY}=${value}; path=/`
}

describe('useTheme', () => {
  const originalMatchMedia = window.matchMedia
  let useTheme: UseThemeModule['useTheme']

  beforeEach(async () => {
    // the store is a module singleton; start every test from a fresh one
    vi.resetModules()
    ;({ useTheme } = await import('../use-theme'))
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    document.cookie = `${STORAGE_THEME_KEY}=; max-age=0; path=/`
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  it('reads the stored preference', () => {
    fakeMatchMedia(true)
    storeTheme('light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.preference).toBe('light')
    expect(result.current.resolved).toBe('light')
  })

  it('falls back to the default preference', () => {
    fakeMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.preference).toBe(DEFAULT_THEME)
  })

  it('stores a new preference and applies it to <html>', () => {
    fakeMatchMedia(false)
    storeTheme('light')
    const { result } = renderHook(() => useTheme())

    act(() => result.current.setPreference('dark'))

    expect(result.current.resolved).toBe('dark')
    expect(document.cookie).toContain(`${STORAGE_THEME_KEY}=dark`)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('follows the OS while the preference is system', () => {
    const os = fakeMatchMedia(false)
    storeTheme('system')
    const { result } = renderHook(() => useTheme())
    expect(result.current.resolved).toBe('light')

    act(() => os.setPrefersDark(true))

    expect(result.current.resolved).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('ignores OS changes under an explicit preference', () => {
    const os = fakeMatchMedia(false)
    storeTheme('light')
    const { result } = renderHook(() => useTheme())

    act(() => os.setPrefersDark(true))

    expect(result.current.resolved).toBe('light')
  })

  it('shares one OS listener across every consumer', () => {
    const os = fakeMatchMedia(false)
    const first = renderHook(() => useTheme())
    const second = renderHook(() => useTheme())
    expect(os.media.addEventListener).toHaveBeenCalledTimes(1)

    first.unmount()
    expect(os.media.removeEventListener).not.toHaveBeenCalled()

    second.unmount()
    expect(os.media.removeEventListener).toHaveBeenCalledTimes(1)
    expect(os.listeners.size).toBe(0)
  })
})
