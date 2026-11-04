import { metrics, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { withSpan } from '@superlog/otel-helpers'

import { MAIL_FROM } from '@/constants/config'
import { isValidDoubanId } from '@/services/wenqu'

import { getResend } from '../../integrations'
import { booksByDoubanIds } from '../../mcp/books'
import { outboundFetch, OutboundUrlError } from '../../outbound/url'
import {
  renderBookMarkdown,
  renderMailMarkdown,
  vaultFileName,
} from './markdown'
import {
  chunkBlocks,
  highlightBlocks,
  NOTION_BLOCKS_PER_PAGE,
  NOTION_BLOCKS_PER_REQUEST,
  notionCalls,
  notionClient,
  type NotionCalls,
} from './notion'
import {
  ExportJobError,
  transientStatus,
  withBackoff,
  retryAfterMs,
} from './retry'
import {
  EXPORT_BATCH_SIZE,
  forEachBookHighlightBatch,
  forEachHighlightBatch,
  listBookGroups,
  type BookGroup,
  type HighlightCursor,
  type HighlightRow,
} from './rows'
import { zipFiles } from './zip'

const tracer = trace.getTracer('clippingkk.web.jobs')
const meter = metrics.getMeter('clippingkk.web.jobs')
const logger = logs.getLogger('clippingkk.web.jobs')
const exportsCompleted = meter.createCounter('exports.completed', {
  description: 'Library exports finished, by destination and outcome',
})
const exportDuration = meter.createHistogram('exports.duration', {
  description: 'Library export duration',
  unit: 'ms',
})

export type ExportDestinationName = 'flomo' | 'notion' | 'mail' | 'obsidian'

export type ExportRequest = {
  destination: ExportDestinationName
  args: string
  uid: number
}

/** Resume cursor. Flomo skips highlights already posted; Notion skips finished books. */
export type ExportCheckpoint = {
  flomo?: { createdAt: string; id: number }
  notionDone?: string[]
}

export type CheckpointStore = {
  read: () => Promise<ExportCheckpoint | null>
  write: (value: ExportCheckpoint) => Promise<void>
}

export type ExportRuntime = {
  batchSize?: number
  flomoConcurrency?: number
  notionIntervalMs?: number
  notionBlocksPerRequest?: number
  notionBlocksPerPage?: number
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  fetch?: typeof fetch
  checkpoint?: CheckpointStore
  sendMail?: (input: {
    to: string
    filename: string
    content: Buffer
  }) => Promise<void>
  openNotion?: (token: string) => NotionCalls
  authors?: (bookIds: string[]) => Promise<Map<string, string>>
}

export type ExportResult = {
  highlights: number
  books: number
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function responseRetryAfter(
  response: { headers: { get(name: string): string | null } },
  now: number
) {
  return retryAfterMs(response.headers.get('retry-after'), now)
}

/** Flomo's inbox URL is reader-supplied, so production posts go through the SSRF guard. */
async function postFlomo(url: string, body: string, fetchImpl?: typeof fetch) {
  if (fetchImpl) {
    return fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  }
  return outboundFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}

async function defaultSendMail(input: {
  to: string
  filename: string
  content: Buffer
}) {
  const result = await getResend().emails.send({
    from: MAIL_FROM,
    to: input.to,
    subject: 'Your ClippingKK export',
    html: '<p>Your ClippingKK export is attached.</p>',
    attachments: [{ filename: input.filename, content: input.content }],
  })
  if (result.error) throw new ExportJobError(result.error.message)
}

async function defaultAuthors(bookIds: string[]) {
  const books = await booksByDoubanIds(bookIds).catch(() => new Map())
  const authors = new Map<string, string>()
  for (const [id, book] of books) authors.set(id, book.author ?? '')
  return authors
}

function assertEmail(value: string) {
  const email = value.trim()
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ExportJobError('Export email is invalid', 'validation')
  }
  return email
}

function assertFlomo(value: string) {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new ExportJobError('Flomo endpoint is not a URL', 'validation')
  }
  if (url.protocol !== 'https:' || url.hostname !== 'flomoapp.com') {
    throw new ExportJobError(
      'Flomo endpoint must be an https://flomoapp.com/ URL',
      'validation'
    )
  }
  return url.toString()
}

function flomoBody(row: HighlightRow) {
  return JSON.stringify({
    content: `# ${row.title}\n\n${row.content}\n\n${row.pageAt}`,
  })
}

async function mapPool<T>(
  items: readonly T[],
  limit: number,
  run: (item: T) => Promise<void>
) {
  if (items.length === 0) return
  let index = 0
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      for (;;) {
        const current = index
        index += 1
        if (current >= items.length) return
        await run(items[current])
      }
    }
  )
  await Promise.all(workers)
}

class FlomoHttpError extends ExportJobError {
  readonly status: number
  readonly retryAfterMs?: number

  constructor(status: number, retryAfter?: number) {
    super(`Flomo returned ${status}`)
    this.status = status
    this.retryAfterMs = retryAfter
  }
}

async function exportToFlomo(
  endpoint: string,
  uid: number,
  runtime: Required<
    Pick<ExportRuntime, 'batchSize' | 'flomoConcurrency' | 'sleep' | 'now'>
  > &
    Pick<ExportRuntime, 'checkpoint' | 'fetch'>
) {
  const url = assertFlomo(endpoint)
  const state: ExportCheckpoint = {
    ...((await runtime.checkpoint?.read()) ?? {}),
  }
  const cursor: HighlightCursor | null = state.flomo
    ? { createdAt: new Date(state.flomo.createdAt), id: state.flomo.id }
    : null
  let highlights = 0
  const books = new Set<string>()
  const post = async (row: HighlightRow) => {
    await withBackoff(
      async () => {
        const response = await postFlomo(url, flomoBody(row), runtime.fetch)
        if (response.status < 200 || response.status >= 300) {
          throw new FlomoHttpError(
            response.status,
            responseRetryAfter(response, runtime.now())
          )
        }
      },
      {
        sleep: runtime.sleep,
        isRetryable: (error) => {
          if (error instanceof OutboundUrlError) return null
          if (!(error instanceof FlomoHttpError)) return {}
          if (!transientStatus(error.status)) return null
          return { retryAfterMs: error.retryAfterMs }
        },
      }
    )
  }

  await forEachHighlightBatch(
    uid,
    runtime.batchSize,
    async (rows) => {
      await mapPool(rows, runtime.flomoConcurrency, post)
      const last = rows[rows.length - 1]
      highlights += rows.length
      for (const row of rows)
        books.add(row.bookId && row.bookId !== '0' ? row.bookId : row.title)
      state.flomo = { createdAt: last.createdAt.toISOString(), id: last.id }
      await runtime.checkpoint?.write(state)
    },
    cursor
  )
  return { highlights, books: books.size }
}

async function eachBook(
  uid: number,
  batchSize: number,
  visit: (book: BookGroup, rows: HighlightRow[]) => Promise<void>
) {
  const books = await listBookGroups(uid)
  let highlights = 0
  for (const book of books) {
    const rows: HighlightRow[] = []
    await forEachBookHighlightBatch(uid, book, batchSize, async (batch) => {
      rows.push(...batch)
    })
    highlights += rows.length
    await visit(book, rows)
  }
  return { books: books.length, highlights }
}

async function exportToMail(
  email: string,
  uid: number,
  runtime: Required<Pick<ExportRuntime, 'batchSize' | 'sendMail'>>
) {
  const to = assertEmail(email)
  const parts: string[] = []
  let highlights = 0
  const books = new Set<string>()
  await forEachHighlightBatch(uid, runtime.batchSize, async (rows) => {
    highlights += rows.length
    for (const row of rows)
      books.add(row.bookId && row.bookId !== '0' ? row.bookId : row.title)
    parts.push(renderMailMarkdown(rows))
  })
  await runtime.sendMail({
    to,
    filename: 'clippingkk-export.md',
    content: Buffer.from(parts.filter(Boolean).join('\n---\n\n')),
  })
  return { highlights, books: books.size }
}

async function exportToObsidian(
  email: string,
  uid: number,
  runtime: Required<Pick<ExportRuntime, 'batchSize' | 'sendMail' | 'authors'>>
) {
  const to = assertEmail(email)
  const grouped: { book: BookGroup; rows: HighlightRow[] }[] = []
  const counted = await eachBook(uid, runtime.batchSize, async (book, rows) => {
    grouped.push({ book, rows })
  })
  const ids = grouped.map(({ book }) => book.bookId).filter(isValidDoubanId)
  const authors = ids.length
    ? await runtime.authors(ids)
    : new Map<string, string>()
  const used = new Set<string>()
  const files = grouped.map(({ book, rows }) => ({
    name: vaultFileName(book.title, book.bookId, used),
    data: renderBookMarkdown({
      title: book.title,
      author: authors.get(book.bookId) ?? '',
      highlights: rows,
    }),
  }))
  await runtime.sendMail({
    to,
    filename: 'clippingkk-obsidian.zip',
    content: zipFiles(files),
  })
  return counted
}

async function exportToNotion(
  value: string,
  uid: number,
  runtime: Required<
    Pick<
      ExportRuntime,
      | 'batchSize'
      | 'sleep'
      | 'now'
      | 'authors'
      | 'notionBlocksPerRequest'
      | 'notionBlocksPerPage'
    >
  > &
    Pick<ExportRuntime, 'checkpoint' | 'openNotion' | 'notionIntervalMs'>
) {
  const [token, targetId] = value.split('|').map((item) => item.trim())
  if (!token || !targetId) {
    throw new ExportJobError(
      'Notion args must be "token | page or database id"',
      'validation'
    )
  }
  const notion =
    runtime.openNotion?.(token) ??
    notionCalls(notionClient(token), {
      sleep: runtime.sleep,
      now: runtime.now,
      intervalMs: runtime.notionIntervalMs,
    })
  const target = await notion.resolve(targetId)
  const state: ExportCheckpoint = {
    ...((await runtime.checkpoint?.read()) ?? {}),
  }
  const done = new Set(state.notionDone ?? [])
  const books = await listBookGroups(uid)
  const authors = await runtime.authors(
    books.map((book) => book.bookId).filter(isValidDoubanId)
  )
  let highlights = 0

  for (const book of books) {
    const rows: HighlightRow[] = []
    await forEachBookHighlightBatch(
      uid,
      book,
      runtime.batchSize,
      async (batch) => {
        rows.push(...batch)
      }
    )
    highlights += rows.length
    if (done.has(book.key)) continue
    const author = authors.get(book.bookId) ?? ''
    const blocks = [
      ...(author && !(target.kind === 'database' && target.authorProperty)
        ? [
            {
              object: 'block' as const,
              type: 'paragraph' as const,
              paragraph: {
                rich_text: [
                  {
                    type: 'text' as const,
                    text: { content: author.slice(0, 2_000) },
                  },
                ],
              },
            },
          ]
        : []),
      ...rows.flatMap((row) => highlightBlocks(row)),
    ]
    const pages = chunkBlocks(blocks, runtime.notionBlocksPerPage)
    const pageBlocks = pages.length > 0 ? pages : [[]]
    for (let index = 0; index < pageBlocks.length; index++) {
      const title =
        pageBlocks.length > 1 ? `${book.title} (${index + 1})` : book.title
      const children = chunkBlocks(
        pageBlocks[index],
        runtime.notionBlocksPerRequest
      )
      const created = await notion.createPage({
        target,
        title,
        author,
        children: children[0] ?? [],
      })
      for (const extra of children.slice(1)) {
        await notion.append(created.id, extra)
      }
    }
    done.add(book.key)
    state.notionDone = [...done]
    await runtime.checkpoint?.write(state)
  }
  return { highlights, books: books.length }
}

function resolved(runtime: ExportRuntime) {
  return {
    batchSize: runtime.batchSize ?? EXPORT_BATCH_SIZE,
    flomoConcurrency: runtime.flomoConcurrency ?? 4,
    notionIntervalMs: runtime.notionIntervalMs,
    notionBlocksPerRequest:
      runtime.notionBlocksPerRequest ?? NOTION_BLOCKS_PER_REQUEST,
    notionBlocksPerPage: runtime.notionBlocksPerPage ?? NOTION_BLOCKS_PER_PAGE,
    sleep: runtime.sleep ?? sleep,
    now: runtime.now ?? Date.now,
    fetch: runtime.fetch,
    checkpoint: runtime.checkpoint,
    sendMail: runtime.sendMail ?? defaultSendMail,
    openNotion: runtime.openNotion,
    authors: runtime.authors ?? defaultAuthors,
  }
}

/**
 * Runs one export. Reads highlights in cursor pages, retries transient HTTP
 * failures, and paces Notion. Mail and Obsidian share the attachment mailer.
 */
export async function runExport(
  request: ExportRequest,
  runtime: ExportRuntime = {}
): Promise<ExportResult> {
  const options = resolved(runtime)
  return withSpan(
    'export.run',
    async (span) => {
      const startedAt = performance.now()
      span.setAttributes({
        'export.destination': request.destination,
        'user.id': request.uid,
      })
      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: 'Export started',
        attributes: {
          'export.destination': request.destination,
          'user.id': request.uid,
        },
      })
      try {
        const result = await dispatch(request, options)
        const attributes = {
          'export.destination': request.destination,
          outcome: 'success',
        }
        span.setAttributes({
          outcome: 'success',
          'highlights.count': result.highlights,
          'books.count': result.books,
        })
        exportsCompleted.add(1, attributes)
        exportDuration.record(performance.now() - startedAt, {
          'export.destination': request.destination,
        })
        logger.emit({
          severityNumber: SeverityNumber.INFO,
          severityText: 'INFO',
          body: 'Export completed',
          attributes: {
            ...attributes,
            'user.id': request.uid,
            'highlights.count': result.highlights,
            'books.count': result.books,
          },
        })
        return result
      } catch (error) {
        const attributes = {
          'export.destination': request.destination,
          outcome: 'error',
        }
        span.setAttribute('outcome', 'error')
        exportsCompleted.add(1, attributes)
        exportDuration.record(performance.now() - startedAt, {
          'export.destination': request.destination,
        })
        logger.emit({
          severityNumber: SeverityNumber.ERROR,
          severityText: 'ERROR',
          body: 'Export failed',
          attributes: {
            ...attributes,
            'user.id': request.uid,
            'error.type': error instanceof Error ? error.name : 'unknown',
          },
        })
        throw error
      }
    },
    { tracer }
  )
}

async function dispatch(
  request: ExportRequest,
  runtime: ReturnType<typeof resolved>
): Promise<ExportResult> {
  switch (request.destination) {
    case 'flomo':
      return exportToFlomo(request.args, request.uid, runtime)
    case 'notion':
      return exportToNotion(request.args, request.uid, runtime)
    case 'mail':
      return exportToMail(request.args, request.uid, runtime)
    case 'obsidian':
      return exportToObsidian(request.args, request.uid, runtime)
    default:
      throw new ExportJobError(
        `Unsupported export destination: ${String(request.destination)}`,
        'validation'
      )
  }
}
