import { STORAGE_LANG_KEY } from '@/constants/storage'
import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { cookies } from 'next/headers'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { getOptions } from './settings'

const initI18next = async (lng: string, ns?: string | string[]) => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string) => import(`../locales/${language}.json`)
      )
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
