
export function useLocalTime(date?: string): string {
  if (!date) {
    return ''
  }

  return new Intl.
    DateTimeFormat(
      navigator.language,
      {
        hour: 'numeric', minute: 'numeric',
        year: 'numeric', month: 'numeric', day: 'numeric',
      }
    ).
    format(new Date(date))
}
