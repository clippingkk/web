import i18n from 'i18next'
import languageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next/initReactI18next'

import en from '../locales/en.json'
import ko from '../locales/ko.json'
import zh from '../locales/zhCN.json'

let instance: typeof i18n | null = null

export function getLanguage() {
  return i18n.language
}

// TODO: use new instance
export function init() {
  instance = i18n.createInstance()
  instance
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: en,
        },
        zh: {
          translation: zh,
        },
        ko: {
          translation: ko,
        }
      },
      react: {
        useSuspense: false
      },
      fallbackLng: 'zh',
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
        caches: ['localStorage', 'cookie'],
      }
    })
  return instance
}
