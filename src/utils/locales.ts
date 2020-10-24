import i18n from 'i18next'
import languageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'

const zhCN = require('../locales/zhCN.yml')
const en = require('../locales/en.yml')
// setTimeout(() => {
//   const language = localStorage.getItem('i18nextLngLong')
//   i18n.changeLanguage(language || 'en')
// })

i18n
  .use(languageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: en
      },
      zhCN: {
        translation: zhCN
      }
    },
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false
    }
  })
