'use client'

import { createInstance, type i18n as I18n } from 'i18next'
import Cookies from 'js-cookie'
import type React from 'react'
import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'

import { STORAGE_LANG_KEY } from '@/constants/storage'
import { toHtmlLang } from '@/lib/theme'

import type { LocaleResources } from './resources'
import { defaultNS, fallbackLng, languages } from './settings'

function createClientI18n(lng: string, resources: LocaleResources): I18n {
  const instance = createInstance()
  // Resources are inlined, so init completes synchronously: the first render
  // (on the server and during hydration) is already in the reader's language.
  void instance.init({
    lng,
    fallbackLng,
    supportedLngs: languages,
    defaultNS,
    fallbackNS: defaultNS,
    ns: Object.keys(resources),
    resources: { [lng]: resources },
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  if (typeof window !== 'undefined') {
    instance.on('languageChanged', (next) => {
      Cookies.set(STORAGE_LANG_KEY, next, { expires: 365, sameSite: 'lax' })
      document.documentElement.lang = toHtmlLang(next)
    })
  }
  return instance
}

type I18nProviderProps = {
  lng: string
  resources: LocaleResources
  children: React.ReactNode
}

/**
 * One i18next instance per request on the server and per page load in the
 * browser, seeded by the server with the reader's language.
 */
function I18nProvider({ lng, resources, children }: I18nProviderProps) {
  const [instance] = useState(() => createClientI18n(lng, resources))

  // A language switch refreshes the server tree with new resources.
  useEffect(() => {
    if (!instance.hasResourceBundle(lng, defaultNS)) {
      for (const [ns, bundle] of Object.entries(resources)) {
        instance.addResourceBundle(lng, ns, bundle, true, true)
      }
    }
    if (instance.language !== lng) void instance.changeLanguage(lng)
  }, [instance, lng, resources])

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}

export default I18nProvider
