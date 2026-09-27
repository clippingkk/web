'use client'

import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import Cookies from 'js-cookie'
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from 'react-i18next'

import { STORAGE_LANG_KEY } from '@/constants/storage'
import { toHtmlLang } from '@/lib/theme'

import { getOptions, languages } from './settings'

const runsOnServerSide = typeof window === 'undefined'

const defaultLang = runsOnServerSide ? undefined : Cookies.get(STORAGE_LANG_KEY)

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string, ns: string) => {
      let lng = language
      if (lng.startsWith('zh')) {
        lng = 'zhCN'
      }
      if (ns && ns !== 'translation') {
        return import(`../locales/${lng}/${ns}.json`)
      }
      return import(`../locales/${lng}.json`)
    })
  )
  .init({
    ...getOptions(defaultLang),
    lng: undefined, // let detect the language on client side
    // lng: defaultLang,
    detection: {
      // order: ['path', 'htmlTag', 'cookie', 'navigator'],
      // order: ['cookie', 'navigator', 'htmlTag'],
      order: ['cookie'],
      lookupCookie: STORAGE_LANG_KEY,
    },
    preload: runsOnServerSide ? languages : [],
  })

if (!runsOnServerSide) {
  i18next.on('languageChanged', (lng) => {
    Cookies.set(STORAGE_LANG_KEY, lng)
    document.documentElement.lang = toHtmlLang(lng)
  })
}

export function useTranslation(_lng?: string, ns?: string, options?: any) {
  return useTranslationOrg(ns, options)
}
