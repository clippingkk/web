import i18next from 'i18next'
import Cookies from 'js-cookie'

import { STORAGE_LANG_KEY } from '@/constants/storage'

/**
 * The active UI language on the client: the language cookie, which every
 * language switch writes, then the i18next default instance, then English.
 * The cookie comes first because that instance only detects the language at
 * page load; the rendered tree uses I18nProvider's instance instead.
 */
export function getLanguage(): string {
  if (typeof document !== 'undefined') {
    const stored = Cookies.get(STORAGE_LANG_KEY)
    if (stored) return stored
  }
  return i18next.language || 'en'
}
