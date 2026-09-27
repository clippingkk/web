import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { initReactI18next } from 'react-i18next/initReactI18next'

import { STORAGE_LANG_KEY } from '@/constants/storage'

import { getOptions } from './settings'

const initI18next = async (lng: string, ns?: string | string[]) => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
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
    .init(getOptions(lng, ns))
  return i18nInstance
}

// Layouts, pages and generateMetadata ask for the same translations within a
// request; build each instance once. Keys are primitives so the cache hits.
const loadTranslation = cache(
  async (lng: string, nsKey: string, keyPrefix: string) => {
    const ns = nsKey ? nsKey.split(',') : undefined
    const i18nextInstance = await initI18next(
      lng,
      ns?.length === 1 ? ns[0] : ns
    )
    return {
      t: i18nextInstance.getFixedT(lng, ns?.[0], keyPrefix || undefined),
      i18n: i18nextInstance,
    }
  }
)

export async function getTranslation(
  lng?: string,
  ns?: string | string[],
  options: { keyPrefix?: string } = {}
) {
  const ck = await cookies()
  const language = lng || ck.get(STORAGE_LANG_KEY)?.value || 'en'
  const nsKey = Array.isArray(ns) ? ns.join(',') : (ns ?? '')
  return loadTranslation(language, nsKey, options.keyPrefix ?? '')
}
