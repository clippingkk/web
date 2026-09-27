/**
 * Every namespace file under src/locales/<lng>/. The default namespace
 * ("translation") lives in src/locales/<lng>.json. Keep in sync with the
 * folder; a test fails when they drift.
 */
export const NAMESPACES = [
  'auth',
  'common',
  'error',
  'import',
  'library',
  'marketing',
  'payment',
  'policy',
  'pricing',
  'profile',
  'reading',
  'report',
  'search',
  'settings',
] as const

export type Namespace = (typeof NAMESPACES)[number]

/** Locale folders are named zhCN for every zh variant. */
export function localeFolder(language: string) {
  return language.startsWith('zh') ? 'zhCN' : language
}
