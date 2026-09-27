import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  bootScript,
  DEFAULT_THEME,
  isThemePreference,
  resolveTheme,
  toHtmlLang,
} from '../theme'

function clearCookies() {
  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  }
}

function runBootScript() {
  // evaluating the inline script is the point of the test
  new Function(bootScript())()
}

describe('theme helpers', () => {
  it('recognises only the three preferences', () => {
    expect(isThemePreference('system')).toBe(true)
    expect(isThemePreference('light')).toBe(true)
    expect(isThemePreference('dark')).toBe(true)
    expect(isThemePreference('sepia')).toBe(false)
    expect(isThemePreference(undefined)).toBe(false)
  })

  it('resolves system against the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('maps stored languages to html lang values', () => {
    expect(toHtmlLang('zh')).toBe('zh-CN')
    expect(toHtmlLang('zhCN')).toBe('zh-CN')
    expect(toHtmlLang('ko')).toBe('ko')
    expect(toHtmlLang('ja-JP')).toBe('ja')
    expect(toHtmlLang('en')).toBe('en')
    expect(toHtmlLang(undefined)).toBe('en')
  })
})

describe('bootScript', () => {
  afterEach(() => {
    clearCookies()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.lang = ''
    vi.unstubAllGlobals()
  })

  it('applies the default theme when no cookie is set', () => {
    runBootScript()
    const isDark = document.documentElement.classList.contains('dark')
    expect(isDark).toBe(DEFAULT_THEME === 'dark')
    expect(document.documentElement.lang).toBe('en')
  })

  it('applies an explicit light preference and the stored language', () => {
    document.documentElement.classList.add('dark')
    document.cookie = 'ck-theme=light; path=/'
    document.cookie = 'ck-lang=zh; path=/'
    runBootScript()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.lang).toBe('zh-CN')
  })

  it('follows the OS when the preference is system', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }) as unknown as MediaQueryList)
    )
    document.cookie = 'ck-theme=system; path=/'
    runBootScript()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('ignores an unknown stored value', () => {
    document.cookie = 'ck-theme=sepia; path=/'
    runBootScript()
    expect(document.documentElement.dataset.theme).toBe(
      DEFAULT_THEME === 'dark' ? 'dark' : 'light'
    )
  })
})
