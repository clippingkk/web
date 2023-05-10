import i18n from 'i18next'
import languageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'
import zhCN from '../locales/zhCN.json'
import ko from '../locales/ko.json'
import en from '../locales/en.json'

function initI18NextInstance() {
  const inst = i18n.createInstance()
  inst
    .use(languageDetector)
    .use(initReactI18next)
    // .use(resourcesToBackend((language: string, namespace: string) => import(`../locales/${language}.json`)))
    .init({
      resources: {
        en: {
          translation: en
        },
        zhCN: {
          translation: zhCN
        },
        ko: {
          translation: ko
        }
      },
      react: {
        useSuspense: false
      },
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    })
  return inst
}

i18n.use(languageDetector)
  .use(initReactI18next)
  // .use(resourcesToBackend((language: string, namespace: string) => import(`../locales/${language}.json`)))
  .init({
    resources: {
      en: {
        translation: en
      },
      zhCN: {
        translation: zhCN
      },
      ko: {
        translation: ko
      }
    },
    react: {
      useSuspense: false
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
