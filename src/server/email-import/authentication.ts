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
 * - a pass only counts when stamped by `authservId`, the receiving server:
 *   anyone can write a header claiming one. Results from other servers can
 *   still make the verdict stricter, never grant it;
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
  /** A pass, but not from `authservId` (or none is configured to trust). */
  | 'unpinned'
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
  const results: { result: string; trusted: boolean }[] = []
  // Repeated headers may arrive joined on one value, by line or by comma:
  // RFC 8601 has no bare comma outside comments and quotes, so each one
  // starts another header (and another authserv-id).
  const headerValues = values
    // A long header folds onto indented lines (RFC 5322); unfold it first.
    .map((value) => value.replace(/\r?\n[ \t]+/g, ' '))
    .flatMap((value) => value.split(/\r?\n/))
    .flatMap((line) => stripCommentsAndQuotes(line).split(','))
  for (const header of headerValues) {
    const [id, ...resinfo] = header.split(';').map((part) => part.trim())
    if (!id) continue
    const trusted =
      !!authservId &&
      id.split(/\s+/)[0].toLowerCase() === authservId.toLowerCase()
    for (const info of resinfo) {
      const match = info.match(/^dmarc\s*=\s*([a-z]+)/i)
      if (match) results.push({ result: match[1].toLowerCase(), trusted })
    }
  }
  if (!results.length) return 'absent'
  const failed = results.find(({ result }) => result !== 'pass')
  if (failed)
    return RESULTS.has(failed.result) ? (failed.result as DmarcResult) : 'other'
  return results.some(({ trusted }) => trusted) ? 'pass' : 'unpinned'
}

/** Resend's verdicts, in the RFC 8601 terms above. */
const RESEND_RESULTS = new Map<string, DmarcResult>([
  ['pass', 'pass'],
  ['fail', 'fail'],
  // SPF or DKIM passed, but the domain has no DMARC policy or `p=none`.
  ['gray', 'none'],
  ['processing_failed', 'temperror'],
  ['unknown', 'absent'],
])

/**
 * The DMARC verdict Resend computed when it received the email (its
 * `authentication` field), or null when it gave none: mail received before
 * Resend added the field. Resend's receiving server (Forge) computes it and
 * adds no `Authentication-Results` header, so this is the one a sender can't
 * forge. When it is present it decides alone; reading the headers as well
 * would let a sender's own header claiming a pinned server's pass count.
 */
export function resendDmarcResult(authentication: unknown): DmarcResult | null {
  if (!authentication || typeof authentication !== 'object') return null
  const { dmarc } = authentication as { dmarc?: unknown }
  if (typeof dmarc !== 'string') return 'absent'
  return RESEND_RESULTS.get(dmarc.toLowerCase()) ?? 'other'
}
