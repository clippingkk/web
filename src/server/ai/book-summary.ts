import { createHash } from 'node:crypto'

import { context, metrics, SpanStatusCode, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { EventType, type StreamChunk } from '@tanstack/ai'
import { and, asc, eq, inArray, isNull } from 'drizzle-orm'

import { getDatabase } from '../db'
import { clippings } from '../db/schema'
import { ApiError } from '../errors'
import { cacheGet, cacheSet } from '../redis'
import {
  BOOK_SUMMARY_SAMPLE,
  evenIndexes,
  highlightLanguage,
  sampleHighlights,
  summaryFingerprint,
} from './book-highlights'
import { generateAI } from './generate'

const tracer = trace.getTracer('clippingkk.web.ai')
const meter = metrics.getMeter('clippingkk.web.ai')
const logger = logs.getLogger('clippingkk.web.ai')
const bookSummaries = meter.createCounter('app.ai.book_summaries')
const duration = meter.createHistogram('app.ai.book_summary.duration', {
  unit: 'ms',
})

/** A month. The same highlights replay from here, so a return visit is not billed. */
const BOOK_SUMMARY_TTL_SECONDS = 30 * 24 * 60 * 60

type BookSummaryRequest = {
  bookId: string
  title: string
  author: string
  force: boolean
}

type CachedBookSummary = {
  fingerprint: string
  text: string
}

export type BookHighlightSource = {
  total: number
  highlights: string[]
}

function cacheKey(userId: number, bookId: string) {
  return `ai:book-summary:v1:${userId}:${bookId}`
}

function fingerprintOf(input: {
  title: string
  author: string
  highlights: readonly string[]
}) {
  return createHash('sha256').update(summaryFingerprint(input)).digest('hex')
}

/**
 * The reader's own highlights for one book, in reading order, already sampled
 * and trimmed. Deleted rows and anyone else's copy of the book are excluded.
 */
export async function loadBookHighlights(
  userId: number,
  bookId: string
): Promise<BookHighlightSource> {
  const where = and(
    eq(clippings.createdBy, userId),
    eq(clippings.bookId, bookId),
    isNull(clippings.deletedAt)
  )
  const rows = await getDatabase()
    .db.select({ id: clippings.id })
    .from(clippings)
    .where(where)
    .orderBy(asc(clippings.id))
  const picked = evenIndexes(rows.length, BOOK_SUMMARY_SAMPLE).map(
    (index) => rows[index]!.id
  )
  if (picked.length === 0) return { total: 0, highlights: [] }
  const contents = await getDatabase()
    .db.select({ content: clippings.content })
    .from(clippings)
    .where(and(where, inArray(clippings.id, picked)))
    .orderBy(asc(clippings.id))
  return {
    total: rows.length,
    highlights: sampleHighlights(contents.map((row) => row.content)),
  }
}

async function readCached(key: string) {
  try {
    const value = await cacheGet<CachedBookSummary>(key)
    if (
      !value ||
      typeof value.fingerprint !== 'string' ||
      typeof value.text !== 'string' ||
      !value.text.trim()
    )
      return null
    return value
  } catch {
    logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: 'WARN',
      body: 'book summary cache read failed',
      attributes: { outcome: 'error' },
    })
    return null
  }
}

async function writeCached(key: string, value: CachedBookSummary) {
  try {
    await cacheSet(key, value, BOOK_SUMMARY_TTL_SECONDS)
    return true
  } catch {
    return false
  }
}

function finishSpan(
  span: ReturnType<typeof tracer.startSpan>,
  started: number,
  outcome: string,
  cache: string
) {
  span.setAttribute('outcome', outcome)
  span.setAttribute('cache', cache)
  if (outcome === 'error') span.setStatus({ code: SpanStatusCode.ERROR })
  bookSummaries.add(1, { outcome })
  duration.record(performance.now() - started, { outcome })
  logger.emit({
    context: trace.setSpan(context.active(), span),
    severityNumber:
      outcome === 'error' ? SeverityNumber.WARN : SeverityNumber.INFO,
    severityText: outcome === 'error' ? 'WARN' : 'INFO',
    body: 'book summary finished',
    attributes: { outcome, cache },
  })
  span.end()
}

function* replayCachedSummary(text: string): Generator<StreamChunk> {
  const messageId = 'book-summary'
  yield {
    type: EventType.RUN_STARTED,
    threadId: 'book-summary',
    runId: 'cache',
  }
  yield { type: EventType.TEXT_MESSAGE_START, messageId, role: 'assistant' }
  yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: text }
  yield { type: EventType.TEXT_MESSAGE_END, messageId }
  yield {
    type: EventType.RUN_FINISHED,
    threadId: 'book-summary',
    runId: 'cache',
  }
}

/**
 * The summary already stored for this reader and book, when the highlights
 * have not changed. A page view uses this and does not call the model.
 */
export async function cachedBookSummary(
  userId: number,
  bookId: string,
  book: { title: string; author: string }
) {
  try {
    const source = await loadBookHighlights(userId, bookId)
    if (source.highlights.length === 0) return null
    const fingerprint = fingerprintOf({
      title: book.title.trim(),
      author: book.author.trim(),
      highlights: source.highlights,
    })
    const cached = await readCached(cacheKey(userId, bookId))
    return cached?.fingerprint === fingerprint ? cached.text : null
  } catch {
    logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: 'WARN',
      body: 'book summary cache lookup failed',
      attributes: { outcome: 'error' },
    })
    return null
  }
}

export async function streamBookSummary(
  userId: number,
  input: BookSummaryRequest,
  signal?: AbortSignal
): Promise<AsyncGenerator<StreamChunk>> {
  const title = input.title.trim()
  const author = input.author.trim()
  const source = await loadBookHighlights(userId, input.bookId)
  if (source.highlights.length === 0) {
    const span = tracer.startSpan('ai.book_summary', {
      attributes: {
        'user.id': userId,
        'book.id': input.bookId,
        'highlights.count': source.total,
        'highlights.sampled': 0,
      },
    })
    finishSpan(span, performance.now(), 'empty', 'none')
    throw new ApiError(
      'This book has no highlights to summarize.',
      404,
      'NOT_FOUND'
    )
  }
  const language = highlightLanguage(source.highlights)
  const fingerprint = fingerprintOf({
    title,
    author,
    highlights: source.highlights,
  })
  const key = cacheKey(userId, input.bookId)
  const cached = input.force ? null : await readCached(key)
  const cachedText = cached?.fingerprint === fingerprint ? cached.text : null
  const cache = cachedText ? 'hit' : input.force ? 'bypass' : 'miss'

  return (async function* () {
    const span = tracer.startSpan('ai.book_summary', {
      attributes: {
        'user.id': userId,
        'book.id': input.bookId,
        'highlights.count': source.total,
        'highlights.sampled': source.highlights.length,
        'highlights.chars': source.highlights.reduce(
          (sum, item) => sum + item.length,
          0
        ),
        cache,
      },
    })
    const started = performance.now()
    let outcome = 'cancelled'
    try {
      if (signal?.aborted) return
      if (cachedText) {
        outcome = 'cache_hit'
        yield* replayCachedSummary(cachedText)
        return
      }
      let text = ''
      for await (const chunk of generateAI(
        {
          kind: 'book',
          language,
          book: { title, author },
          highlights: source.highlights,
        },
        signal
      )) {
        if (chunk.type === 'TEXT_MESSAGE_CONTENT') text += chunk.delta
        if (chunk.type === 'RUN_FINISHED' && !signal?.aborted && text.trim()) {
          const saved = await writeCached(key, {
            fingerprint,
            text: text.trim(),
          })
          if (!saved) {
            logger.emit({
              context: trace.setSpan(context.active(), span),
              severityNumber: SeverityNumber.WARN,
              severityText: 'WARN',
              body: 'book summary cache write failed',
              attributes: { outcome: 'error' },
            })
          }
        }
        yield chunk
      }
      outcome = 'generated'
    } catch (error) {
      outcome = signal?.aborted ? 'cancelled' : 'error'
      if (outcome === 'error') {
        span.recordException(
          error instanceof ApiError ? error : new Error('book summary failed')
        )
      }
      throw error
    } finally {
      finishSpan(span, started, outcome, cache)
    }
  })()
}
