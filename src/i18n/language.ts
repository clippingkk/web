import i18next from 'i18next'
import Cookies from 'js-cookie'

import { STORAGE_LANG_KEY } from '@/constants/storage'

/**
 * The active UI language on the client: the i18next instance once it has
 * detected one, then the language cookie, then English.
 */
export function getLanguage(): string {
  if (i18next.language) return i18next.language
  if (typeof document !== 'undefined') {
    const stored = Cookies.get(STORAGE_LANG_KEY)
    if (stored) return stored
  }
  return 'en'
}
