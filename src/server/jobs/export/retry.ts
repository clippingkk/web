import { logs, SeverityNumber } from '@opentelemetry/api-logs'

const logger = logs.getLogger('clippingkk.web.jobs')

/** Statuses worth another attempt: rate limits, timeouts, and upstream 5xx. */
const TRANSIENT_STATUS = new Set([408, 425, 429, 500, 502, 503, 504, 529])

export class ExportJobError extends Error {
  constructor(message: string, kind: 'validation' | 'upstream' = 'upstream') {
    super(message)
    this.name = kind
  }
}

export type RetryDecision = {
  retryAfterMs?: number
}

export function retryAfterMs(
  header: string | null | undefined,
  now = Date.now()
) {
  if (!header) return undefined
  const seconds = Number(header)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(header)
  if (Number.isNaN(date)) return undefined
  return Math.max(0, date - now)
}

export function transientStatus(status: number): RetryDecision | null {
  return TRANSIENT_STATUS.has(status) ? {} : null
}

/**
 * Retries a failed export request. `Retry-After` wins over exponential
 * backoff. The last error is rethrown so the job can fail visibly.
 */
export async function withBackoff<T>(
  run: () => Promise<T>,
  options: {
    attempts?: number
    baseDelayMs?: number
    maxDelayMs?: number
    sleep?: (ms: number) => Promise<void>
    isRetryable?: (error: unknown) => RetryDecision | null
    onRetry?: (info: {
      attempt: number
      delayMs: number
      error: unknown
    }) => void
  } = {}
): Promise<T> {
  const attempts = options.attempts ?? 5
  const baseDelayMs = options.baseDelayMs ?? 500
  const maxDelayMs = options.maxDelayMs ?? 30_000
  const sleep =
    options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  const isRetryable = options.isRetryable ?? (() => null)
  let last: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await run()
    } catch (error) {
      last = error
      const decision = isRetryable(error)
      if (!decision || attempt === attempts) throw error
      const delayMs =
        decision.retryAfterMs ??
        Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1))
      options.onRetry?.({ attempt, delayMs, error })
      logger.emit({
        severityNumber: SeverityNumber.WARN,
        severityText: 'WARN',
        body: 'Export request will retry',
        attributes: {
          attempt,
          'retry.delay_ms': delayMs,
          'error.type': error instanceof Error ? error.name : 'unknown',
        },
      })
      if (delayMs > 0) await sleep(delayMs)
    }
  }
  throw last
}

/**
 * Spaces calls so a burst stays under a sustained rate. Notion's average
 * limit is about 3 requests per second; callers pass ~350ms.
 */
export function createPace(
  intervalMs: number,
  sleep: (ms: number) => Promise<void>,
  now: () => number = Date.now
) {
  let nextAt = 0
  let tail: Promise<void> = Promise.resolve()
  return function pace() {
    const run = tail.then(async () => {
      const wait = Math.max(0, nextAt - now())
      if (wait > 0) await sleep(wait)
      nextAt = now() + intervalMs
    })
    tail = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }
}

/** Push the pace gate out after a rate-limit response. */
export function createRateGate(
  intervalMs: number,
  sleep: (ms: number) => Promise<void>,
  now: () => number = Date.now
) {
  const pace = createPace(intervalMs, sleep, now)
  let blockedUntil = 0
  return {
    async wait() {
      const extra = Math.max(0, blockedUntil - now())
      if (extra > 0) await sleep(extra)
      await pace()
    },
    blockFor(ms: number) {
      blockedUntil = Math.max(blockedUntil, now() + ms)
    },
  }
}
