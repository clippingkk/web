import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { cookies } from 'next/headers'
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

export async function useTranslation(
  lng?: string,
  ns?: string | string[],
  options: { keyPrefix?: string } = {}
) {
  const ck = await cookies()
  const defaultLng = ck.get(STORAGE_LANG_KEY)?.value ?? 'en'
  if (!lng) {
    lng = defaultLng
  }
  const i18nextInstance = await initI18next(lng, ns)
  return {
    t: i18nextInstance.getFixedT(
      lng,
      Array.isArray(ns) ? ns[0] : ns,
      options.keyPrefix
    ),
    i18n: i18nextInstance,
  }
}
