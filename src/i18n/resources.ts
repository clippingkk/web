import 'server-only'
import { localeFolder, NAMESPACES } from './namespaces'
import { fallbackLng, languages } from './settings'

export type LocaleResources = Record<string, Record<string, unknown>>

export function normalizeLanguage(value?: string | null): string {
  const lng = (value ?? '').toLowerCase()
  if (lng.startsWith('zh')) return 'zh'
  return (languages as readonly string[]).includes(lng) ? lng : fallbackLng
}

/** All translations for one language, to seed the client i18n instance. */
export async function loadResources(
  language: string
): Promise<LocaleResources> {
  const folder = localeFolder(language)
  const [translation, ...namespaces] = await Promise.all([
    import(`../locales/${folder}.json`).then((m) => m.default),
    ...NAMESPACES.map((ns) =>
      import(`../locales/${folder}/${ns}.json`).then((m) => m.default)
    ),
  ])
  const resources: LocaleResources = { translation }
  NAMESPACES.forEach((ns, index) => {
    resources[ns] = namespaces[index]
  })
  return resources
}
