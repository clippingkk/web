import { toHtmlLang } from '@/lib/theme'

type DateStyle = 'short' | 'medium' | 'long'

const formatters = new Map<string, Intl.DateTimeFormat>()

/**
 * Formats a date the same way on the server and in the browser: the locale
 * comes from the UI language and the time zone is pinned to UTC, so the
 * rendered text never causes a hydration mismatch.
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  language?: string | null,
  style: DateStyle = 'medium'
): string {
  if (value === null || value === undefined || value === '') return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const locale = toHtmlLang(language)
  const key = `${locale}:${style}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: style,
      timeZone: 'UTC',
    })
    formatters.set(key, formatter)
  }
  return formatter.format(date)
}

export function toIsoString(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === '') return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
