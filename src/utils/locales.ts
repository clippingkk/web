'use client';

import i18n from 'i18next'
import languageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'
import zhCN from '../locales/zhCN.json'
import ko from '../locales/ko.json'
import en from '../locales/en.json'

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
