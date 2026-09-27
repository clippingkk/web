/**
 * Every namespace file under src/locales/<lng>/. The default namespace
 * ("translation") lives in src/locales/<lng>.json. Keep in sync with the
 * folder; a test fails when they drift.
 */
export const NAMESPACES = [
  'auth',
  'book',
  'clipping-detail',
  'clippings',
  'common',
  'error',
  'home',
  'import',
  'library',
  'marketing',
  'navigation',
  'payment',
  'policy',
  'pricing',
  'profile',
  'reading',
  'report',
  'search',
  'settings',
  'upload',
  'webhook',
] as const

export type Namespace = (typeof NAMESPACES)[number]

/** Locale folders are named zhCN for every zh variant. */
export function localeFolder(language: string) {
  return language.startsWith('zh') ? 'zhCN' : language
}
