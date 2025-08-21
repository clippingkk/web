export const fallbackLng = 'en'
export const languages = [fallbackLng, 'zh', 'ja', 'ko'] as const
export const defaultNS = 'translation'

export function getOptions(
  lng = fallbackLng,
  ns: string | string[] = defaultNS
) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng: lng || fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  }
}
