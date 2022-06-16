import i18n from 'i18next'
import languageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'
import zhCN from '../locales/zhCN.yml'
import ko from '../locales/ko.yml'
import en from '../locales/en.yml'

i18n
  .use(languageDetector)
  .use(initReactI18next)
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
