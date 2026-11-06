const languageNames = new Intl.DisplayNames(['en'], {
  type: 'language',
  fallback: 'none',
})

export type OutputLanguage = {
  /** A canonical tag, safe to use in a cache key. */
  tag: string
  /** The English name a prompt can use, for example "Simplified Chinese". */
  name: string
}

const ENGLISH: OutputLanguage = { tag: 'en', name: 'English' }

/**
 * Turns a client-supplied language into a name for the prompt. Anything that
 * is not a real language tag becomes English, so the raw string never reaches
 * a prompt or a cache key.
 */
export function outputLanguage(raw?: string | null): OutputLanguage {
  try {
    const locale = new Intl.Locale(
      (raw ?? '')
        .trim()
        .replace(/^zhCN$/i, 'zh-CN')
        .replaceAll('_', '-')
    ).maximize()
    const tag =
      locale.language === 'zh' ? `zh-${locale.script}` : locale.language
    const name = languageNames.of(tag)
    return name ? { tag, name } : ENGLISH
  } catch {
    return ENGLISH
  }
}
