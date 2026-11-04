// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { APIErrorCode, APIResponseError, type Client } from '@notionhq/client'
import type { Job } from 'bullmq'
import { drizzle } from 'drizzle-orm/pglite'

import { resetServerEnvForTests } from '@/server/env'

import { migratePglite } from '../../db/__tests__/pglite'

const { outboundFetch, bull } = vi.hoisted(() => ({
  outboundFetch: vi.fn(),
  bull: {
    queues: [] as { name: string; jobs: { name: string; data: unknown }[] }[],
    workers: [] as {
      name: string
      concurrency?: number
      closed: Array<() => void>
    }[],
  },
}))

vi.mock('../../outbound/url', () => ({
  outboundFetch,
  OutboundUrlError: class OutboundUrlError extends Error {},
}))

vi.mock('bullmq', () => ({
  Queue: class {
    jobs: { name: string; data: unknown }[] = []
    constructor(public name: string) {
      bull.queues.push(this)
    }
    add(name: string, data: unknown) {
      this.jobs.push({ name, data })
      return Promise.resolve({ id: 'job-1' })
    }
  },
  Worker: class {
    closed: Array<() => void> = []
    constructor(
      public name: string,
      _processor: unknown,
      public opts: { concurrency?: number }
    ) {
      bull.workers.push({
        name,
        concurrency: opts.concurrency,
        closed: this.closed,
      })
    }
    on(event: string, callback: () => void) {
      if (event === 'closed') this.closed.push(callback)
      return this
    }
  },
}))

vi.mock('../../db', () => ({ getDatabase: vi.fn() }))
vi.mock('../../redis', () => ({
  cacheGet: vi.fn(async () => undefined),
  cacheSet: vi.fn(async () => {}),
  cacheDelete: vi.fn(async () => {}),
}))
vi.mock('../../integrations', () => ({
  getResend: () => ({
    emails: {
      send: vi.fn(async () => ({ data: { id: 'mail-1' }, error: null })),
    },
  }),
  getNotion: () => {
    throw new Error('tests pass an openNotion double')
  },
}))

import { getDatabase } from '../../db'
import * as schema from '../../db/schema'
import { renderBookMarkdown } from '../export/markdown'
import { notionCalls } from '../export/notion'
import { loadHighlightBatch } from '../export/rows'
import {
  runExport,
  type CheckpointStore,
  type ExportCheckpoint,
} from '../export/run'
import { readZip, zipFiles } from '../export/zip'
import {
  EXPORT_QUEUE_NAME,
  JOB_QUEUE_NAME,
  enqueueEmailImport,
  enqueueExport,
} from '../queues'
import { processJob, startWorker } from '../worker'

const pg = new PGlite()
const db = drizzle(pg, { schema })

const instant = async () => {}

function memoryCheckpoint(): CheckpointStore & {
  value: ExportCheckpoint | null
} {
  const store = {
    value: null as ExportCheckpoint | null,
    async read() {
      return store.value
    },
    async write(value: ExportCheckpoint) {
      store.value = value
    },
  }
  return store
}

function rateLimited() {
  return new APIResponseError({
    code: APIErrorCode.RateLimited,
    status: 429,
    message: 'rate limited',
    headers: { 'retry-after': '2' },
    rawBodyText: '',
    additional_data: undefined,
    request_id: undefined,
  })
}

function missing() {
  return new APIResponseError({
    code: APIErrorCode.ObjectNotFound,
    status: 404,
    message: 'missing',
    headers: {},
    rawBodyText: '',
    additional_data: undefined,
    request_id: undefined,
  })
}

function fakeNotion(kind: 'page' | 'database') {
  const calls: { op: string; args: unknown }[] = []
  let createFailures = 0
  const client = {
    databases: {
      async retrieve({ database_id }: { database_id: string }) {
        calls.push({ op: 'database', args: database_id })
        if (kind === 'page') throw missing()
        return {
          object: 'database' as const,
          id: database_id,
          data_sources: [{ id: 'ds-1', name: 'Highlights' }],
        }
      },
    },
    dataSources: {
      async retrieve() {
        calls.push({ op: 'data-source', args: 'ds-1' })
        return {
          object: 'data_source' as const,
          id: 'ds-1',
          properties: {
            Name: { type: 'title' as const, title: {} },
            Author: { type: 'rich_text' as const, rich_text: {} },
          },
        }
      },
    },
    pages: {
      async retrieve({ page_id }: { page_id: string }) {
        calls.push({ op: 'retrieve-page', args: page_id })
        return { object: 'page' as const, id: page_id }
      },
      async create(args: unknown) {
        calls.push({ op: 'create', args })
        if (createFailures > 0) {
          createFailures -= 1
          throw rateLimited()
        }
        return { id: `created-${calls.length}` }
      },
    },
    blocks: {
      children: {
        async append(args: unknown) {
          calls.push({ op: 'append', args })
        },
      },
    },
  }
  return {
    calls,
    client: client as unknown as Client,
    failCreates(times: number) {
      createFailures = times
    },
  }
}

function exportJob(data: unknown) {
  const job = {
    name: 'export-data',
    id: 'export-1',
    data,
    progress: 0 as unknown,
    attemptsMade: 0,
    opts: {},
    async updateProgress(value: unknown) {
      job.progress = value
    },
  }
  return job as unknown as Job
}

beforeAll(async () => {
  await migratePglite(pg)
}, 30_000)

beforeEach(async () => {
  process.env.DATABASE_URL = 'postgresql://postgres:admin@localhost:5432/test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.JWT_SECRET = 'test-jwt-secret'
  resetServerEnvForTests()
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
  await pg.exec('TRUNCATE clippings RESTART IDENTITY')
})

async function insertHighlights(
  rows: {
    title: string
    content: string
    bookId?: string
    pageAt?: string
    createdAt: string
    createdBy?: number
    deletedAt?: Date
  }[]
) {
  await db.insert(schema.clippings).values(
    rows.map((row, index) => ({
      title: row.title,
      content: row.content,
      bookId: row.bookId ?? '',
      pageAt: row.pageAt ?? '',
      dataId: `${row.createdBy ?? 1}-${index}-${row.createdAt}`,
      createdBy: row.createdBy ?? 1,
      visible: true,
      createdAt: new Date(row.createdAt),
      deletedAt: row.deletedAt,
    }))
  )
}

describe('vault zip', () => {
  test('declares entry names as UTF-8 so CJK titles survive unzip', () => {
    const archive = zipFiles([
      { name: 'clippingkk/三体.md', data: 'highlight' },
    ])
    expect(archive.readUInt16LE(6)).toBe(0x0800)
    let centralFlags: number | undefined
    let offset = 0
    while (offset + 4 <= archive.length) {
      if (archive.readUInt32LE(offset) === 0x02014b50) {
        centralFlags = archive.readUInt16LE(offset + 8)
        break
      }
      offset += 1
    }
    expect(centralFlags).toBe(0x0800)
    expect(readZip(archive).map((entry) => entry.name)).toEqual([
      'clippingkk/三体.md',
    ])
  })
})

describe('highlight cursor', () => {
  test('pages through one reader and skips deleted rows and other readers', async () => {
    await insertHighlights([
      { title: 'A', content: 'one', createdAt: '2026-01-01T00:00:00.000Z' },
      { title: 'A', content: 'two', createdAt: '2026-01-01T00:00:01.000Z' },
      {
        title: 'A',
        content: 'gone',
        createdAt: '2026-01-01T00:00:02.000Z',
        deletedAt: new Date('2026-02-01T00:00:00.000Z'),
      },
      {
        title: 'A',
        content: 'other',
        createdAt: '2026-01-01T00:00:03.000Z',
        createdBy: 2,
      },
      { title: 'B', content: 'three', createdAt: '2026-01-01T00:00:04.000Z' },
    ])

    const first = await loadHighlightBatch(1, null, 2)
    expect(first.map((row) => row.content)).toEqual(['one', 'two'])
    const second = await loadHighlightBatch(
      1,
      { createdAt: first[1].createdAt, id: first[1].id },
      2
    )
    expect(second.map((row) => row.content)).toEqual(['three'])
  })
})

describe('worker exports', () => {
  test('posts flomo in batches, retries rate limits, and resumes after the last finished batch', async () => {
    await insertHighlights([
      {
        title: 'A',
        content: 'one',
        pageAt: '1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        title: 'A',
        content: 'two',
        pageAt: '2',
        createdAt: '2026-01-01T00:00:01.000Z',
      },
      {
        title: 'B',
        content: 'three',
        pageAt: '3',
        createdAt: '2026-01-01T00:00:02.000Z',
      },
      {
        title: 'B',
        content: 'four',
        pageAt: '4',
        createdAt: '2026-01-01T00:00:03.000Z',
      },
      {
        title: 'B',
        content: 'five',
        pageAt: '5',
        createdAt: '2026-01-01T00:00:04.000Z',
      },
    ])
    const posted: string[] = []
    let block = true
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const content = JSON.parse(String(init?.body)).content as string
      if (block && posted.length >= 2) {
        return new Response('slow', {
          status: 429,
          headers: { 'retry-after': '1' },
        })
      }
      posted.push(content)
      return new Response('ok', { status: 200 })
    })
    const sleeps: number[] = []
    const checkpoint = memoryCheckpoint()
    const request = {
      destination: 'flomo' as const,
      args: 'https://flomoapp.com/iwh/test',
      uid: 1,
    }
    await expect(
      runExport(request, {
        batchSize: 2,
        flomoConcurrency: 1,
        fetch: fetchMock as typeof fetch,
        sleep: async (ms) => {
          sleeps.push(ms)
        },
        checkpoint,
      })
    ).rejects.toThrow('Flomo returned 429')
    expect(posted).toEqual(['# A\n\none\n\n1', '# A\n\ntwo\n\n2'])
    expect(sleeps).toContain(1000)
    expect(checkpoint.value?.flomo?.id).toBeTypeOf('number')

    block = false
    const result = await runExport(request, {
      batchSize: 2,
      flomoConcurrency: 1,
      fetch: fetchMock as typeof fetch,
      sleep: instant,
      checkpoint,
    })
    expect(posted.map((body) => body.split('\n\n')[1])).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
    ])
    expect(result).toEqual({ highlights: 3, books: 1 })
  })

  test('rejects a flomo endpoint on another host before posting', async () => {
    const fetchMock = vi.fn()
    await expect(
      runExport(
        { destination: 'flomo', args: 'https://example.com/hook', uid: 1 },
        { fetch: fetchMock as typeof fetch, sleep: instant }
      )
    ).rejects.toThrow('flomoapp.com')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('emails one markdown file built from cursor pages', async () => {
    await insertHighlights([
      {
        title: 'A',
        content: 'one',
        pageAt: 'p1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        title: 'B',
        content: 'two',
        pageAt: 'p2',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ])
    const sendMail = vi.fn(async () => {})
    const result = await runExport(
      { destination: 'mail', args: 'reader@example.com', uid: 1 },
      { batchSize: 1, sendMail }
    )
    expect(result).toEqual({ highlights: 2, books: 2 })
    expect(sendMail).toHaveBeenCalledWith({
      to: 'reader@example.com',
      filename: 'clippingkk-export.md',
      content: Buffer.from('# A\n\none\n\np1\n\n---\n\n# B\n\ntwo\n\np2\n'),
    })
  })

  test('emails an obsidian vault with one note per book', async () => {
    await insertHighlights([
      {
        title: 'Three Body',
        content: 'first line\nsecond',
        bookId: '1234',
        pageAt: '10',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        title: 'Three Body',
        content: 'later',
        bookId: '1234',
        pageAt: '11',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
      {
        title: 'Unmatched',
        content: 'loose',
        pageAt: '',
        createdAt: '2026-01-03T00:00:00.000Z',
      },
    ])
    const sendMail = vi.fn(
      async (_input: { filename: string; content: Buffer }) => {}
    )
    const result = await runExport(
      { destination: 'obsidian', args: 'reader@example.com', uid: 1 },
      {
        sendMail,
        authors: async (ids) => new Map(ids.map((id) => [id, 'Liu Cixin'])),
      }
    )
    expect(result).toEqual({ highlights: 3, books: 2 })
    const attachment = sendMail.mock.calls[0][0]
    expect(attachment.filename).toBe('clippingkk-obsidian.zip')
    const files = readZip(attachment.content)
    expect(files.map((file) => file.name).sort()).toEqual([
      'clippingkk/Three Body.md',
      'clippingkk/Unmatched.md',
    ])
    const note = files
      .find((file) => file.name.endsWith('Three Body.md'))!
      .data.toString()
    expect(note).toBe(
      renderBookMarkdown({
        title: 'Three Body',
        author: 'Liu Cixin',
        highlights: [
          { content: 'first line\nsecond', pageAt: '10' },
          { content: 'later', pageAt: '11' },
        ],
      })
    )
    expect(note).toContain('title: "Three Body"')
    expect(note).toContain('author: "Liu Cixin"')
    expect(note).toContain('highlights: 2')
    expect(
      files.find((file) => file.name.endsWith('Unmatched.md'))!.data.toString()
    ).toContain('author: ""')
  })

  test('writes one notion page per book and appends the overflow blocks', async () => {
    await insertHighlights([
      {
        title: 'Three Body',
        content: 'one',
        bookId: '1234',
        pageAt: '1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        title: 'Three Body',
        content: 'two',
        bookId: '1234',
        pageAt: '2',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
      {
        title: 'Three Body',
        content: 'three',
        bookId: '1234',
        pageAt: '3',
        createdAt: '2026-01-03T00:00:00.000Z',
      },
      {
        title: 'Other',
        content: 'four',
        bookId: '5678',
        pageAt: '9',
        createdAt: '2026-01-04T00:00:00.000Z',
      },
    ])
    const notion = fakeNotion('page')
    const sleeps: number[] = []
    await runExport(
      { destination: 'notion', args: 'secret-token|page-parent', uid: 1 },
      {
        sleep: async (ms) => {
          sleeps.push(ms)
        },
        now: () => 0,
        authors: async () => new Map(),
        notionBlocksPerRequest: 4,
        openNotion: () =>
          notionCalls(notion.client, {
            sleep: async (ms) => {
              sleeps.push(ms)
            },
            now: () => 0,
            intervalMs: 350,
          }),
      }
    )
    const creates = notion.calls.filter((call) => call.op === 'create')
    expect(creates).toHaveLength(2)
    const first = creates[0].args as {
      parent: { page_id?: string }
      children: unknown[]
    }
    expect(first.parent).toEqual({ type: 'page_id', page_id: 'page-parent' })
    expect(first.children).toHaveLength(4)
    const appends = notion.calls.filter((call) => call.op === 'append')
    expect(appends).toHaveLength(1)
    expect(appends[0].args).toMatchObject({
      block_id: 'created-3',
      children: expect.any(Array),
    })
    expect((appends[0].args as { children: unknown[] }).children).toHaveLength(
      2
    )
    expect(JSON.stringify(appends)).not.toContain('page-parent')
    expect(sleeps).toContain(350)
  })

  test('writes each book into a notion database and waits out a rate limit', async () => {
    await insertHighlights([
      {
        title: 'Three Body',
        content: 'one',
        bookId: '1234',
        pageAt: '1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ])
    const notion = fakeNotion('database')
    notion.failCreates(1)
    const sleeps: number[] = []
    await runExport(
      { destination: 'notion', args: 'secret-token|database-id', uid: 1 },
      {
        sleep: async (ms) => {
          sleeps.push(ms)
        },
        now: () => 0,
        authors: async () => new Map([['1234', 'Liu Cixin']]),
        openNotion: () =>
          notionCalls(notion.client, {
            sleep: async (ms) => {
              sleeps.push(ms)
            },
            now: () => 0,
            intervalMs: 350,
          }),
      }
    )
    const creates = notion.calls.filter((call) => call.op === 'create')
    expect(creates).toHaveLength(2)
    expect(creates[1].args).toMatchObject({
      parent: { type: 'data_source_id', data_source_id: 'ds-1' },
      properties: {
        Name: { type: 'title' },
        Author: { type: 'rich_text' },
      },
    })
    expect(sleeps).toContain(2000)
    expect(notion.calls.some((call) => call.op === 'append')).toBe(false)
  })

  test('skips notion books that already finished', async () => {
    await insertHighlights([
      {
        title: 'A',
        content: 'one',
        bookId: '1234',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        title: 'B',
        content: 'two',
        bookId: '5678',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ])
    const notion = fakeNotion('page')
    const checkpoint = memoryCheckpoint()
    checkpoint.value = { notionDone: ['id:1234'] }
    await runExport(
      { destination: 'notion', args: 'secret-token|page-parent', uid: 1 },
      {
        sleep: instant,
        now: () => 0,
        authors: async () => new Map(),
        checkpoint,
        openNotion: () =>
          notionCalls(notion.client, {
            sleep: instant,
            now: () => 0,
            intervalMs: 0,
          }),
      }
    )
    const creates = notion.calls.filter((call) => call.op === 'create')
    expect(creates).toHaveLength(1)
    expect(creates[0].args).toMatchObject({
      properties: { title: { title: [{ text: { content: 'B' } }] } },
    })
  })

  test('processJob runs an export and stores the resume cursor on the job', async () => {
    await insertHighlights([
      {
        title: 'A',
        content: 'one',
        pageAt: '1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ])
    outboundFetch.mockResolvedValue({
      status: 200,
      headers: new Headers(),
      body: 'ok',
      url: 'https://flomoapp.com/iwh/test',
    })
    const job = exportJob({
      destination: 'flomo',
      args: 'https://flomoapp.com/iwh/test',
      uid: 1,
    })
    await expect(processJob(job)).resolves.toEqual({ highlights: 1, books: 1 })
    expect(outboundFetch).toHaveBeenCalledOnce()
    expect(outboundFetch).toHaveBeenCalledWith(
      'https://flomoapp.com/iwh/test',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('# A'),
      })
    )
    expect(job.progress).toMatchObject({ flomo: { id: 1 } })
  })

  test('processJob rejects an unknown destination', async () => {
    await expect(
      processJob(exportJob({ destination: 'dropbox', args: '', uid: 1 }))
    ).rejects.toThrow('Unsupported export destination')
  })
})

describe('export queue', () => {
  test('keeps exports off the email-import queue and gives them their own concurrency', async () => {
    await enqueueExport({
      destination: 'obsidian',
      args: 'reader@example.com',
      uid: 4,
    })
    await enqueueEmailImport({
      emailId: 'email-1',
      from: 'reader@example.com',
      to: ['kindle@import.example'],
      receivedFor: ['kindle@import.example'],
      subject: 'notebook',
      receivedAt: '2026-01-01T00:00:00.000Z',
    })
    const exportQueue = bull.queues.find(
      (queue) => queue.name === EXPORT_QUEUE_NAME
    )
    const jobQueue = bull.queues.find((queue) => queue.name === JOB_QUEUE_NAME)
    expect(EXPORT_QUEUE_NAME).not.toBe(JOB_QUEUE_NAME)
    expect(exportQueue?.jobs).toEqual([
      {
        name: 'export-data',
        data: { destination: 'obsidian', args: 'reader@example.com', uid: 4 },
      },
    ])
    expect(jobQueue?.jobs.map((job) => job.name)).toEqual(['import-email'])
    expect(jobQueue?.jobs[0]).toMatchObject({
      name: 'import-email',
    })

    process.env.EXPORT_WORKER_CONCURRENCY = '2'
    process.env.WORKER_CONCURRENCY = '1'
    const worker = startWorker()
    expect(bull.workers.map((item) => [item.name, item.concurrency])).toEqual([
      [JOB_QUEUE_NAME, 1],
      [EXPORT_QUEUE_NAME, 2],
    ])
    for (const item of bull.workers) for (const close of item.closed) close()
    await worker.close?.()
  })
})
