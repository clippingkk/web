/**
 * The DMARC verdict in a received email's `Authentication-Results` headers
 * (RFC 8601). The From address is the only credential the import has, so this
 * reads the header strictly:
 *
 * - every header that differs only in case is read, so a sender can't add a
 *   second `authentication-results` of their own to shadow the receiver's;
 * - comments and quoted strings are dropped first, so `spf=fail (dmarc=pass)`
 *   or `reason="dmarc=pass"` count for nothing;
 * - only a `dmarc=` that starts a result counts;
 * - with an `authservId`, results stamped by any other server are ignored;
 * - if several DMARC results are found, any one that isn't a pass wins.
 */

/** RFC 8601 DMARC results; anything else reads as `other`. */
const RESULTS = new Set(['pass', 'fail', 'none', 'temperror', 'permerror'])

export type DmarcResult =
  | 'pass'
  | 'fail'
  | 'none'
  | 'temperror'
  | 'permerror'
  | 'other'
  | 'absent'

function stripCommentsAndQuotes(value: string) {
  let text = value.replace(/"(?:[^"\\]|\\.)*"/g, '""')
  // Comments nest; peel them from the inside out.
  let previous: string
  do {
    previous = text
    text = text.replace(/\([^()]*\)/g, ' ')
  } while (text !== previous)
  return text
}

export function dmarcResult(
  headers: Record<string, string> | null,
  authservId?: string
): DmarcResult {
  const values = Object.entries(headers ?? {})
    .filter(([name]) => name.toLowerCase() === 'authentication-results')
    .map(([, value]) => value)
  const results: string[] = []
  // Repeated headers may arrive joined on one value, one per line.
  for (const line of values.flatMap((value) => value.split(/\r?\n/))) {
    const [id, ...resinfo] = stripCommentsAndQuotes(line)
      .split(';')
      .map((part) => part.trim())
    if (!id) continue
    if (
      authservId &&
      id.split(/\s+/)[0].toLowerCase() !== authservId.toLowerCase()
    )
      continue
    for (const info of resinfo) {
      const match = info.match(/^dmarc\s*=\s*([a-z]+)/i)
      if (match) results.push(match[1].toLowerCase())
    }
  }
  if (!results.length) return 'absent'
  const verdict = results.find((result) => result !== 'pass') ?? 'pass'
  return RESULTS.has(verdict) ? (verdict as DmarcResult) : 'other'
}
