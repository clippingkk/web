import { cookies } from 'next/headers'
import type React from 'react'

import { STORAGE_LANG_KEY } from '@/constants/storage'

import I18nProvider from './provider'
import { loadResources, normalizeLanguage } from './resources'

/** Seeds client components with the reader's language (from the cookie). */
async function I18nRoot({ children }: { children: React.ReactNode }) {
  const lng = normalizeLanguage((await cookies()).get(STORAGE_LANG_KEY)?.value)
  const resources = await loadResources(lng)
  return (
    <I18nProvider lng={lng} resources={resources}>
      {children}
    </I18nProvider>
  )
}

export default I18nRoot
