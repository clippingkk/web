import { STORAGE_LANG_KEY, STORAGE_THEME_KEY } from '@/constants/storage'

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]
export type ResolvedTheme = 'light' | 'dark'

// Light mode has never shipped, so dark stays the default until every route
// has been checked in both themes. Flip to 'system' after that.
export const DEFAULT_THEME: ThemePreference = 'dark'

/**
 * What the server renders on <html> before the boot script runs. The server
 * cannot see the OS setting, so a 'system' default renders light and the boot
 * script corrects it before first paint.
 */
export const SERVER_THEME: ResolvedTheme = resolveTheme(DEFAULT_THEME, false)

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === 'string' &&
    (THEME_PREFERENCES as readonly string[]).includes(value)
  )
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}

/** Maps a stored language code (`zh`, `zhCN`, `ko`…) to an `html[lang]` value. */
export function toHtmlLang(language?: string | null): string {
  const lng = (language ?? '').toLowerCase()
  if (lng.startsWith('zh')) return 'zh-CN'
  if (lng.startsWith('ja')) return 'ja'
  if (lng.startsWith('ko')) return 'ko'
  return 'en'
}

/**
 * Runs synchronously in <head> before first paint: applies the theme and the
 * document language from cookies, so the root layout never has to read
 * cookies() (which would make every segment dynamic under cacheComponents).
 * Keep it dependency-free and in sync with resolveTheme/toHtmlLang.
 */
export function bootScript(): string {
  return `(function(){try{var d=document.documentElement,c=document.cookie;function g(n){var m=c.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):''}var t=g(${JSON.stringify(STORAGE_THEME_KEY)});if(t!=='light'&&t!=='dark'&&t!=='system')t=${JSON.stringify(DEFAULT_THEME)};var k=t==='dark'||(t==='system'&&!!window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',k);d.setAttribute('data-theme',k?'dark':'light');var l=g(${JSON.stringify(STORAGE_LANG_KEY)}).toLowerCase();d.lang=l.indexOf('zh')===0?'zh-CN':l.indexOf('ja')===0?'ja':l.indexOf('ko')===0?'ko':'en'}catch(e){}})()`
}

export function applyResolvedTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.setAttribute('data-theme', theme)
}
