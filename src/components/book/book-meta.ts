/** Wenqu dates are ISO timestamps or loose strings like "2003-8". */
export function publishedYear(pubdate?: string | null) {
  if (!pubdate) return ''
  const match = /^(\d{4})/.exec(pubdate.trim())
  return match ? match[1] : pubdate
}
