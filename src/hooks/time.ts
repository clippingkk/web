export function useLocalTime(date?: string): string {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(process.browser ? navigator.language : 'en', {
    hour: 'numeric',
    minute: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(date))
}
