'use client'

import { STORAGE_LANG_KEY } from '@/constants/storage'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from 'react-i18next'
import { getOptions, languages } from './settings'

const runsOnServerSide = typeof window === 'undefined'

const defaultLang = runsOnServerSide ? undefined : Cookies.get(STORAGE_LANG_KEY)

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string) => import(`../locales/${language}.json`)
    )
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTranslation(lng?: string, ns?: string, options?: any) {
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret
  useEffect(() => {
    i18n.on('languageChanged', (lng) => {
      Cookies.set(STORAGE_LANG_KEY, lng)
    })
    return () => {
      i18n.off('languageChanged')
    }
  }, [])
  return ret
}
