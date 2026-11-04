import type { LookupAddress, LookupOptions } from 'node:dns'
import { lookup } from 'node:dns/promises'
import type { IncomingHttpHeaders } from 'node:http'
import { request as httpsRequest } from 'node:https'
import type { RequestOptions } from 'node:https'
import { BlockList, isIP } from 'node:net'

/**
 * Guard for reader-supplied outbound URLs (clipping webhooks and the Flomo
 * export endpoint).
 *
 * HTTPS is required. Flomo's API is HTTPS, and webhooks have no need for
 * cleartext HTTP. HTTP would reach internal services that only speak HTTP
 * (instance metadata, link-local admin ports) and would let an on-path
 * attacker rewrite the target.
 *
 * The host is checked again after DNS resolution. The socket then uses only
 * those addresses, so a name cannot rebind to a private IP between the check
 * and the connection. Redirects are followed by hand and each target is
 * checked the same way. Responses are bounded by a timeout and a body cap.
 */

const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_MAX_BYTES = 64_000
const DEFAULT_MAX_REDIRECTS = 3
const MAX_URL_LENGTH = 2048

const BLOCKED_MESSAGE = 'URL must be a public https address'
const UNRESOLVED_MESSAGE = 'URL host could not be resolved'

export class OutboundUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OutboundUrlError'
  }
}

export interface ResolvedAddress {
  address: string
  family: 4 | 6
}

export type OutboundResolver = (
  hostname: string
) => Promise<readonly ResolvedAddress[]>

export interface OutboundTarget {
  url: URL
  addresses: readonly ResolvedAddress[]
}

export interface OutboundRequest {
  url: URL
  method: string
  headers: Record<string, string>
  body?: string
  addresses: readonly ResolvedAddress[]
  signal: AbortSignal
  maxBytes: number
}

export interface OutboundExchange {
  status: number
  headers: Record<string, string | string[]>
  body: string
}

export type OutboundTransport = (
  request: OutboundRequest
) => Promise<OutboundExchange>

export interface OutboundFetchInit {
  method?: string
  headers?: Record<string, string>
  body?: string
  timeoutMs?: number
  maxBytes?: number
  maxRedirects?: number
  resolve?: OutboundResolver
  transport?: OutboundTransport
}

export interface OutboundResponse {
  status: number
  headers: Headers
  body: string
  url: string
}

const blocked = new BlockList()
const ipv4Subnets: readonly (readonly [string, number])[] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]
const ipv6Subnets: readonly (readonly [string, number])[] = [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['fec0::', 10],
  ['ff00::', 8],
  // Teredo. Not a webhook destination, and the embedded client address is an
  // easy way to hide a private IPv4 target.
  ['2001::', 32],
]
for (const [address, prefix] of ipv4Subnets)
  blocked.addSubnet(address, prefix, 'ipv4')
for (const [address, prefix] of ipv6Subnets)
  blocked.addSubnet(address, prefix, 'ipv6')

function normalizedHost(hostname: string): string {
  let host = hostname.trim().toLowerCase()
  if (host.startsWith('[') && host.endsWith(']')) host = host.slice(1, -1)
  return host.replace(/\.+$/, '')
}

function ipv6Bytes(address: string): Buffer | null {
  const halves = address.split('::')
  if (halves.length > 2) return null
  const parseSide = (side: string): number[] | null => {
    if (!side) return []
    const words: number[] = []
    for (const part of side.split(':')) {
      if (part.includes('.')) {
        const nums = part.split('.')
        if (nums.length !== 4) return null
        const bytes = nums.map((item) => Number(item))
        if (
          bytes.some(
            (value) => !Number.isInteger(value) || value < 0 || value > 255
          )
        )
          return null
        const [a = 0, b = 0, c = 0, d = 0] = bytes
        words.push((a << 8) | b, (c << 8) | d)
        continue
      }
      if (!/^[0-9a-f]{1,4}$/.test(part)) return null
      words.push(Number.parseInt(part, 16))
    }
    return words
  }
  const left = parseSide(halves[0] ?? '')
  const right = halves.length === 2 ? parseSide(halves[1] ?? '') : []
  if (!left || !right) return null
  const missing = 8 - (left.length + right.length)
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null
  const words = [...left, ...Array.from({ length: missing }, () => 0), ...right]
  if (words.length !== 8) return null
  const bytes = Buffer.alloc(16)
  words.forEach((word, index) => bytes.writeUInt16BE(word, index * 2))
  return bytes
}

/** IPv4 carried inside NAT64, 6to4, or deprecated IPv4-compatible space. */
function embeddedIpv4(bytes: Buffer): string | null {
  const at = (offset: number) =>
    [0, 1, 2, 3].map((shift) => bytes[offset + shift] ?? 0).join('.')
  const zero = (start: number, end: number) =>
    bytes.subarray(start, end).every((value) => value === 0)
  if (bytes[0] === 0x20 && bytes[1] === 0x02) return at(2)
  if (
    bytes[0] === 0x00 &&
    bytes[1] === 0x64 &&
    bytes[2] === 0xff &&
    bytes[3] === 0x9b &&
    zero(4, 12)
  )
    return at(12)
  if (
    bytes[0] === 0x00 &&
    bytes[1] === 0x64 &&
    bytes[2] === 0xff &&
    bytes[3] === 0x9b &&
    bytes[4] === 0x00 &&
    bytes[5] === 0x01 &&
    zero(6, 12)
  )
    return at(12)
  if (zero(0, 12)) return at(12)
  return null
}

/**
 * True for addresses that must not be dialed: loopback, RFC1918, link-local
 * (including 169.254.169.254), CGNAT, IPv6 ULA and link-local, and the same
 * ranges hidden inside a mapped, NAT64, or 6to4 address.
 */
export function isBlockedAddress(address: string): boolean {
  const ip = normalizedHost(address)
  if (!ip || ip.includes('%')) return true
  const family = isIP(ip)
  if (family === 4) return blocked.check(ip, 'ipv4')
  if (family !== 6) return true
  if (blocked.check(ip, 'ipv6')) return true
  const bytes = ipv6Bytes(ip)
  if (!bytes) return true
  const embedded = embeddedIpv4(bytes)
  return embedded !== null && blocked.check(embedded, 'ipv4')
}

function literalAddress(host: string): ResolvedAddress | null {
  const family = isIP(host)
  if (family !== 4 && family !== 6) return null
  if (isBlockedAddress(host)) throw new OutboundUrlError(BLOCKED_MESSAGE)
  return { address: host, family }
}

function assertDnsName(host: string) {
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localdomain') ||
    !host.includes('.')
  )
    throw new OutboundUrlError(BLOCKED_MESSAGE)
}

async function defaultResolve(hostname: string): Promise<ResolvedAddress[]> {
  let records: { address: string; family: number }[]
  try {
    records = await lookup(hostname, { all: true, verbatim: true })
  } catch {
    throw new OutboundUrlError(UNRESOLVED_MESSAGE)
  }
  if (!records.length) throw new OutboundUrlError(UNRESOLVED_MESSAGE)
  return records.map((record) => ({
    address: record.address,
    family: record.family === 6 ? 6 : 4,
  }))
}

export async function assertOutboundUrl(
  input: string,
  options?: { resolve?: OutboundResolver }
): Promise<OutboundTarget> {
  if (typeof input !== 'string' || input.length > MAX_URL_LENGTH)
    throw new OutboundUrlError(BLOCKED_MESSAGE)
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    throw new OutboundUrlError(BLOCKED_MESSAGE)
  }
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new OutboundUrlError(BLOCKED_MESSAGE)
  const host = normalizedHost(url.hostname)
  if (!host) throw new OutboundUrlError(BLOCKED_MESSAGE)
  if (isIP(host) === 6) url.hostname = host
  else if (url.hostname !== host) url.hostname = host
  if (url.href.length > MAX_URL_LENGTH)
    throw new OutboundUrlError(BLOCKED_MESSAGE)

  const literal = literalAddress(host)
  if (literal) return { url, addresses: [literal] }

  assertDnsName(host)
  const resolve = options?.resolve ?? defaultResolve
  let resolved: readonly ResolvedAddress[]
  try {
    resolved = await resolve(host)
  } catch (error) {
    if (error instanceof OutboundUrlError) throw error
    throw new OutboundUrlError(UNRESOLVED_MESSAGE)
  }
  if (!resolved.length) throw new OutboundUrlError(UNRESOLVED_MESSAGE)
  const addresses = resolved.map((record) => {
    const address = normalizedHost(record.address)
    const family = isIP(address)
    if (family !== 4 && family !== 6)
      throw new OutboundUrlError(UNRESOLVED_MESSAGE)
    if (isBlockedAddress(address)) throw new OutboundUrlError(BLOCKED_MESSAGE)
    return { address, family } satisfies ResolvedAddress
  })
  return { url, addresses }
}

/**
 * DNS callback that returns the addresses already accepted by
 * `assertOutboundUrl`. It never calls the system resolver.
 */
export function createPinnedLookup(
  addresses: readonly ResolvedAddress[]
): NonNullable<RequestOptions['lookup']> {
  return (_hostname, options, callback) => {
    const settings: LookupOptions = options ?? {}
    const requested = settings.family
    const matching =
      requested === 4 || requested === 6
        ? addresses.filter((item) => item.family === requested)
        : [...addresses]
    const done = callback as (
      error: NodeJS.ErrnoException | null,
      address: string | LookupAddress[],
      family?: number
    ) => void
    if (matching.length === 0) {
      done(
        Object.assign(new Error('no pinned address'), { code: 'ENOTFOUND' }),
        ''
      )
      return
    }
    if (settings.all) {
      done(
        null,
        matching.map((item) => ({
          address: item.address,
          family: item.family,
        }))
      )
      return
    }
    const first = matching[0]
    if (!first) {
      done(
        Object.assign(new Error('no pinned address'), { code: 'ENOTFOUND' }),
        ''
      )
      return
    }
    done(null, first.address, first.family)
  }
}

function headerRecord(
  headers: IncomingHttpHeaders
): Record<string, string | string[]> {
  const record: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string' || Array.isArray(value)) record[key] = value
  }
  return record
}

function contentLength(headers: IncomingHttpHeaders): number | null {
  const value = headers['content-length']
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function defaultTransport(
  outbound: OutboundRequest
): Promise<OutboundExchange> {
  if (outbound.signal.aborted)
    return Promise.reject(new OutboundUrlError('outbound request timed out'))
  return new Promise((resolve, reject) => {
    let settled = false
    let clientRequest: ReturnType<typeof httpsRequest> | undefined
    const finish = (error: Error | null, value?: OutboundExchange) => {
      if (settled) return
      settled = true
      outbound.signal.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else if (value) resolve(value)
    }
    const onAbort = () => {
      clientRequest?.destroy()
      finish(new OutboundUrlError('outbound request timed out'))
    }
    const hostname = normalizedHost(outbound.url.hostname)
    const headers = { ...outbound.headers }
    if (outbound.body !== undefined)
      headers['content-length'] = String(Buffer.byteLength(outbound.body))
    clientRequest = httpsRequest(
      {
        protocol: 'https:',
        hostname,
        port: outbound.url.port || 443,
        path: `${outbound.url.pathname}${outbound.url.search}`,
        method: outbound.method,
        headers,
        agent: false,
        rejectUnauthorized: true,
        ...(isIP(hostname) ? {} : { servername: hostname }),
        lookup: createPinnedLookup(outbound.addresses),
        signal: outbound.signal,
      },
      (response) => {
        const status = response.statusCode ?? 0
        if (isRedirect(status)) {
          const headers = headerRecord(response.headers)
          response.destroy()
          finish(null, { status, headers, body: '' })
          return
        }
        const declared = contentLength(response.headers)
        if (declared !== null && declared > outbound.maxBytes) {
          response.destroy()
          finish(new OutboundUrlError('response exceeds size limit'))
          return
        }
        const chunks: Buffer[] = []
        let received = 0
        response.on('data', (chunk: Buffer | string) => {
          if (settled) return
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
          received += buffer.length
          if (received > outbound.maxBytes) {
            response.destroy()
            finish(new OutboundUrlError('response exceeds size limit'))
            return
          }
          chunks.push(buffer)
        })
        response.on('end', () => {
          finish(null, {
            status,
            headers: headerRecord(response.headers),
            body: Buffer.concat(chunks).toString('utf8'),
          })
        })
        response.on('error', (error) => finish(error))
      }
    )
    outbound.signal.addEventListener('abort', onAbort, { once: true })
    clientRequest.on('error', (error) => {
      if (outbound.signal.aborted)
        finish(new OutboundUrlError('outbound request timed out'))
      else finish(error)
    })
    if (outbound.body !== undefined) clientRequest.write(outbound.body)
    clientRequest.end()
  })
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

function isRedirect(status: number) {
  return REDIRECT_STATUSES.has(status)
}

function methodAfterRedirect(status: number, method: string) {
  if (status === 303 && method !== 'GET' && method !== 'HEAD') return 'GET'
  if ((status === 301 || status === 302) && method === 'POST') return 'GET'
  return method
}

const STRIPPED_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
])

function requestHeaders(
  source: Record<string, string> | undefined,
  method: string
) {
  const headers: Record<string, string> = {}
  const dropBody = method === 'GET' || method === 'HEAD'
  for (const [key, value] of Object.entries(source ?? {})) {
    const name = key.toLowerCase()
    if (STRIPPED_HEADERS.has(name)) continue
    if (dropBody && name === 'content-type') continue
    headers[key] = value
  }
  return headers
}

function headerValue(
  headers: Record<string, string | string[]>,
  name: string
): string | null {
  const found = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name
  )
  const value = found?.[1]
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function toHeaders(headers: Record<string, string | string[]>) {
  const result = new Headers()
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) result.append(key, item)
    } else result.set(key, value)
  }
  return result
}

export async function outboundFetch(
  input: string,
  init?: OutboundFetchInit
): Promise<OutboundResponse> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxBytes = init?.maxBytes ?? DEFAULT_MAX_BYTES
  const maxRedirects = init?.maxRedirects ?? DEFAULT_MAX_REDIRECTS
  const resolve = init?.resolve
  const transport = init?.transport ?? defaultTransport
  const signal = AbortSignal.timeout(timeoutMs)
  let method = (init?.method ?? 'GET').toUpperCase()
  let body = method === 'GET' || method === 'HEAD' ? undefined : init?.body
  let current = input
  let redirects = 0

  while (true) {
    if (signal.aborted) throw new OutboundUrlError('outbound request timed out')
    const target = await assertOutboundUrl(current, { resolve })
    const exchange = await new Promise<OutboundExchange>(
      (resolveExchange, reject) => {
        const onAbort = () =>
          reject(new OutboundUrlError('outbound request timed out'))
        if (signal.aborted) {
          onAbort()
          return
        }
        signal.addEventListener('abort', onAbort, { once: true })
        transport({
          url: target.url,
          method,
          headers: requestHeaders(init?.headers, method),
          body,
          addresses: target.addresses,
          signal,
          maxBytes,
        }).then(
          (value) => {
            signal.removeEventListener('abort', onAbort)
            resolveExchange(value)
          },
          (error: unknown) => {
            signal.removeEventListener('abort', onAbort)
            if (signal.aborted)
              reject(new OutboundUrlError('outbound request timed out'))
            else reject(error)
          }
        )
      }
    )

    if (!isRedirect(exchange.status)) {
      if (Buffer.byteLength(exchange.body) > maxBytes)
        throw new OutboundUrlError('response exceeds size limit')
      return {
        status: exchange.status,
        headers: toHeaders(exchange.headers),
        body: exchange.body,
        url: target.url.href,
      }
    }

    redirects += 1
    if (redirects > maxRedirects)
      throw new OutboundUrlError('too many redirects')
    const location = headerValue(exchange.headers, 'location')
    if (!location) throw new OutboundUrlError('redirect is missing a location')
    let next: URL
    try {
      next = new URL(location, target.url)
    } catch {
      throw new OutboundUrlError(BLOCKED_MESSAGE)
    }
    method = methodAfterRedirect(exchange.status, method)
    if (method === 'GET' || method === 'HEAD') body = undefined
    current = next.href
  }
}
