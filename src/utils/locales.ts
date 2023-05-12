import i18n from 'i18next'
import languageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'

export function getLanguage() {
  return i18n.language
}

// TODO: use new instance
export function init() {
  i18n.use(languageDetector)
    .use(initReactI18next)
    .use(resourcesToBackend(
      (language: string, namespace: string) => import(`../locales/${language}.json`))
    )
    .init({
      react: {
        useSuspense: false
      },
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    })
}

init()
