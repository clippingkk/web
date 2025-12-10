'use client'

import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from 'react-i18next'
import { STORAGE_LANG_KEY } from '@/constants/storage'
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

 
export function useTranslation(_lng?: string, ns?: string, options?: any) {
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret
  useEffect(() => {
    i18n.on('languageChanged', (lng) => {
      Cookies.set(STORAGE_LANG_KEY, lng)
    })
    return () => {
      i18n.off('languageChanged')
    }
  }, [i18n.off, i18n.on])
  return ret
}
