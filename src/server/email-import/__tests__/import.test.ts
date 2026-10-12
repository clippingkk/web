// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { asc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { receiving, send, redis, wenquRequest } = vi.hoisted(() => ({
  receiving: {
    get: vi.fn(),
    attachments: { list: vi.fn() },
  },
  send: vi.fn(),
  redis: new Map<string, unknown>(),
  wenquRequest: vi.fn(),
}))
vi.mock('../../db', () => ({ getDatabase: vi.fn() }))
vi.mock('../../redis', () => ({
  cacheDelete: vi.fn(async () => {}),
  cacheGet: async (key: string) => redis.get(key),
  cacheSet: async (key: string, value: unknown) => {
    redis.set(key, value)
  },
  rateLimit: async (key: string, limit: number) => {
    const count = Number(redis.get(key) ?? 0) + 1
    redis.set(key, count)
    return { allowed: count <= limit, count }
  },
}))
vi.mock('../../integrations', () => ({
  getResend: () => ({ emails: { receiving, send } }),
}))
vi.mock('@/services/wenqu', () => ({ wenquRequest }))

import { getDatabase } from '../../db'
import * as schema from '../../db/schema'
import { resetServerEnvForTests } from '../../env'
import type { EmailImportJob } from '../../jobs/queues'
import { importEmail } from '../import'

const pg = new PGlite()
const db = drizzle(pg, { schema })

const READER = 1
const TITLE = '经略幽燕：宋辽战争军事灾难的战略分析'
const BOOK = '26936532'
const INBOUND = 'kindle@import.clippingkk.example'
const MESSAGE_ID = '<notebook-export@icloud.com>'
const STRANGER = 'Stranger <Stranger@example.com>'
const RECEIVED_AT = '2026-10-12T08:00:00.000Z'
let sample = ''

const job = (overrides: Partial<EmailImportJob> = {}): EmailImportJob => ({
  emailId: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c',
  from: 'Reader <Reader@iCloud.com>',
  to: [INBOUND],
  receivedFor: [INBOUND],
  subject: `iPhone Notebook export for ${TITLE} (曾瑞龙)`,
  receivedAt: RECEIVED_AT,
  ...overrides,
})

/** Resend serving one email with `attachments` (name → HTML). */
function serve(
  attachments: Record<string, string>,
  { headers = {}, html = null }: { headers?: object; html?: string | null } = {}
) {
  receiving.get.mockResolvedValue({
    data: {
      id: job().emailId,
      message_id: MESSAGE_ID,
      headers,
      html,
      attachments: [],
    },
    error: null,
  })
  receiving.attachments.list.mockResolvedValue({
    data: {
      object: 'list',
      has_more: false,
      data: Object.entries(attachments).map(([filename, content]) => ({
        id: filename,
        filename,
        size: Buffer.byteLength(content),
        content_type: 'text/html',
        content_disposition: 'attachment',
        download_url: `https://inbound-cdn.resend.example/${filename}`,
        expires_at: RECEIVED_AT,
      })),
    },
    error: null,
  })
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const name = String(url).split('/').at(-1)!
    return new Response(attachments[name], {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  })
}

const readerClippings = () =>
  db
    .select()
    .from(schema.clippings)
    .where(eq(schema.clippings.createdBy, READER))
    .orderBy(asc(schema.clippings.createdAt))

beforeAll(async () => {
  for (const name of (await readdir('drizzle'))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    await pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
  sample = await readFile(
    join(__dirname, '__fixtures__', 'notebook.html'),
    'utf8'
  )
}, 30000)

beforeEach(async () => {
  process.env.DATABASE_URL = 'postgresql://postgres:admin@localhost:5432/test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
  process.env.INBOUND_EMAIL_ADDRESS = INBOUND
  resetServerEnvForTests()
  vi.restoreAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  await pg.exec(
    'TRUNCATE users, clippings, nouns, web_hooks, email_bindings, reader_notes RESTART IDENTITY'
  )
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
  redis.clear()
  send.mockReset()
  send.mockResolvedValue({ data: { id: 'reply' }, error: null })
  wenquRequest.mockReset()
  wenquRequest.mockResolvedValue({ count: 1, books: [{ doubanId: BOOK }] })
  await db.insert(schema.users).values({
    id: READER,
    name: 'Reader',
    email: 'reader@example.com',
    pwd: '',
    checked: true,
  })
  await db.insert(schema.emailBindings).values({
    userId: READER,
    email: 'reader@icloud.com',
    verifiedAt: new Date(),
  })
})

describe('importEmail', () => {
  it('saves every highlight of the attached notebook as the sender’s clippings', async () => {
    serve({ 'Notebook.html': sample })

    await expect(importEmail(job())).resolves.toBe('imported')

    const rows = await readerClippings()
    expect(rows).toHaveLength(22)
    expect(rows[0]).toMatchObject({
      title: TITLE,
      bookId: BOOK,
      pageAt: '#197',
      visible: true,
      source: 1,
      createdAt: new Date(RECEIVED_AT),
    })
    expect(rows.at(-1)!.pageAt).toBe('#6896')
    expect(wenquRequest).toHaveBeenCalledWith(
      `/books/search?query=${encodeURIComponent(TITLE)}&limit=50&offset=0`,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    const [binding] = await db.select().from(schema.emailBindings)
    expect(binding.lastImportedAt).toBeInstanceOf(Date)
  })

  it('imports nothing twice when the same export is sent again', async () => {
    serve({ 'Notebook.html': sample })
    await importEmail(job())
    await importEmail(job({ emailId: 'b2b6f0d4-another-email' }))

    expect(await readerClippings()).toHaveLength(22)
  })

  it('skips highlights already imported from My Clippings.txt and reuses their book', async () => {
    await db.insert(schema.clippings).values({
      title: TITLE,
      // The .txt export writes a location range and spaces the text differently.
      content:
        '在日常用語中，和平常常被賦予更積極的意義。所謂「維護世界和平」的口號中所講的「和平」， 很難想像其內涵包括了互相確保摧毀在內。',
      pageAt: '#197-198',
      bookId: '1000001',
      dataId: 'from-txt',
      createdBy: READER,
    })
    serve({ 'Notebook.html': sample })

    await importEmail(job())

    const rows = await readerClippings()
    expect(rows).toHaveLength(22)
    expect(rows.every((row) => row.bookId === '1000001')).toBe(true)
    expect(wenquRequest).not.toHaveBeenCalled()
  })

  it('saves notes apart from clippings, linked to their highlight', async () => {
    serve({
      'Notebook.html': `<div class="bodyContainer"><div class="bookTitle">Walden (Henry David Thoreau)</div>
<div class="noteHeading">Highlight(<span class="annotation_yellow">yellow</span>) - Location 10</div>
<div class="noteText">I went to the woods because I wished to live deliberately.</div>
<div class="noteHeading">Note - Location 11</div>
<div class="noteText">Why I keep reading this.</div></div>`,
    })
    wenquRequest.mockResolvedValue({ count: 0, books: [] })

    await importEmail(job())

    const [clipping] = await readerClippings()
    expect(clipping).toMatchObject({ title: 'Walden', bookId: '0' })
    expect(await db.select().from(schema.readerNotes)).toEqual([
      expect.objectContaining({
        userId: READER,
        clippingId: clipping.id,
        title: 'Walden',
        pageAt: '#11',
        content: 'Why I keep reading this.',
      }),
    ])
    // Notes are idempotent too.
    await importEmail(job())
    expect(await db.select().from(schema.readerNotes)).toHaveLength(1)
  })

  it('replies to an unverified sender with the notebook as JSON', async () => {
    serve({ 'Notebook.html': sample })

    await expect(importEmail(job({ from: STRANGER }))).resolves.toBe('replied')

    expect(await readerClippings()).toEqual([])
    expect(send).toHaveBeenCalledOnce()
    const [message, options] = send.mock.calls[0]
    expect(message).toMatchObject({
      to: 'stranger@example.com',
      subject: `Re: iPhone Notebook export for ${TITLE} (曾瑞龙)`,
      headers: { 'In-Reply-To': MESSAGE_ID, References: MESSAGE_ID },
    })
    expect(options).toEqual({
      idempotencyKey: `email-import-reply/${job().emailId}`,
    })
    const [attachment] = message.attachments
    expect(attachment).toMatchObject({
      filename: `${TITLE}.json`,
      contentType: 'application/json',
    })
    const json = JSON.parse(attachment.content.toString('utf8'))
    expect(json.clippings).toHaveLength(22)
    expect(json.clippings[0]).toEqual({
      title: TITLE,
      author: '曾瑞龙',
      content: expect.stringMatching(/^在日常用語中，和平常常被賦予/),
      pageAt: '#197',
      createdAt: RECEIVED_AT,
    })
    expect(json.notes).toEqual([])
    // The unbound sender is still reported, masked.
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('sender is not bound')
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('s***@example.com')
    )
  })

  it('treats an address still waiting for its code as unverified', async () => {
    await db.insert(schema.emailBindings).values({
      userId: READER,
      email: 'pending@example.com',
      codeHash: 'pending',
    })
    serve({ 'Notebook.html': sample })

    await expect(
      importEmail(job({ from: 'pending@example.com' }))
    ).resolves.toBe('replied')
    expect(await readerClippings()).toEqual([])
  })

  it('replies to one sender at most five times a day', async () => {
    serve({ 'Notebook.html': sample })
    for (let i = 0; i < 5; i++)
      await expect(
        importEmail(job({ emailId: `email-${i}`, from: STRANGER }))
      ).resolves.toBe('replied')

    await expect(
      importEmail(job({ emailId: 'email-5', from: STRANGER }))
    ).resolves.toBe('reply_limited')
    expect(send).toHaveBeenCalledTimes(5)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('"reply.limit":"sender_day"')
    )
    await expect(
      importEmail(job({ emailId: 'email-6', from: 'other@example.com' }))
    ).resolves.toBe('replied')
  })

  it('does no work for a stranger over the limit, notebook or not', async () => {
    serve({ 'Receipt.html': '<p>Not a notebook</p>' })
    for (let i = 0; i < 5; i++)
      await expect(
        importEmail(job({ emailId: `junk-${i}`, from: STRANGER }))
      ).resolves.toBe('no_notebook')
    receiving.get.mockClear()
    receiving.attachments.list.mockClear()
    vi.mocked(fetch).mockClear()

    await expect(
      importEmail(job({ emailId: 'junk-5', from: STRANGER }))
    ).resolves.toBe('reply_limited')
    expect(receiving.get).not.toHaveBeenCalled()
    expect(receiving.attachments.list).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('downloads a single attachment for a stranger', async () => {
    serve({ 'Notebook.html': sample, 'Second.html': sample })

    await expect(importEmail(job({ from: STRANGER }))).resolves.toBe('replied')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('retries a failed reply with the same idempotency key, counting it once', async () => {
    serve({ 'Notebook.html': sample })
    send.mockResolvedValueOnce({
      data: null,
      error: { name: 'internal_server_error', message: 'unavailable' },
    })

    await expect(importEmail(job({ from: STRANGER }))).rejects.toThrow(
      'Resend send: unavailable'
    )
    await expect(importEmail(job({ from: STRANGER }))).resolves.toBe('replied')
    expect(send.mock.calls[1][1]).toEqual(send.mock.calls[0][1])

    for (let i = 0; i < 4; i++)
      await expect(
        importEmail(job({ emailId: `more-${i}`, from: STRANGER }))
      ).resolves.toBe('replied')
    await expect(
      importEmail(job({ emailId: 'more-4', from: STRANGER }))
    ).resolves.toBe('reply_limited')
  })

  it('never answers forged mail or mail without a notebook', async () => {
    serve(
      { 'Notebook.html': sample },
      {
        headers: {
          'Authentication-Results':
            'mx.resend.com; spf=fail smtp.mailfrom=example.com; dmarc=fail header.from=example.com',
        },
      }
    )
    await expect(importEmail(job({ from: STRANGER }))).resolves.toBe(
      'failed_authentication'
    )

    serve({ 'Receipt.html': '<p>Thanks for your order</p>' })
    await expect(importEmail(job({ from: STRANGER }))).resolves.toBe(
      'no_notebook'
    )

    await expect(importEmail(job({ from: 'Nobody' }))).resolves.toBe(
      'unreadable_sender'
    )
    expect(send).not.toHaveBeenCalled()
    // Every unbound sender is still reported, notebook or not.
    expect(
      vi
        .mocked(console.error)
        .mock.calls.filter(([line]) =>
          String(line).includes('sender is not bound')
        )
    ).toHaveLength(2)
  })

  it('imports for a verified sender without replying', async () => {
    serve({ 'Notebook.html': sample })

    await expect(importEmail(job())).resolves.toBe('imported')
    expect(send).not.toHaveBeenCalled()
  })

  it('drops mail that fails DMARC', async () => {
    serve(
      { 'Notebook.html': sample },
      {
        headers: {
          'Authentication-Results':
            'mx.resend.com; spf=fail smtp.mailfrom=icloud.com; dmarc=fail header.from=icloud.com',
        },
      }
    )

    await expect(importEmail(job())).resolves.toBe('failed_authentication')
    expect(await readerClippings()).toEqual([])
  })

  it('imports only on a DMARC pass when Resend reports a result', async () => {
    const results = (dmarc: string) => ({
      headers: {
        'Authentication-Results': `mx.resend.com; spf=pass smtp.mailfrom=icloud.com; dmarc=${dmarc} header.from=icloud.com`,
      },
    })
    for (const dmarc of ['none', 'temperror']) {
      serve({ 'Notebook.html': sample }, results(dmarc))
      await expect(importEmail(job())).resolves.toBe('failed_authentication')
      // Nor is a forgery from a domain without a DMARC policy answered.
      await expect(importEmail(job({ from: STRANGER }))).resolves.toBe(
        'failed_authentication'
      )
    }
    expect(await readerClippings()).toEqual([])
    expect(send).not.toHaveBeenCalled()

    serve({ 'Notebook.html': sample }, results('pass'))
    await expect(importEmail(job())).resolves.toBe('imported')
    expect(await readerClippings()).toHaveLength(22)
  })

  it('keeps one copy of a highlight repeated on another page', async () => {
    serve({
      'Notebook.html': `<div class="bodyContainer"><div class="bookTitle">Walden (Henry David Thoreau)</div>
<div class="noteHeading">Highlight(<span class="annotation_yellow">yellow</span>) - Location 10</div>
<div class="noteText">Simplify, simplify.</div>
<div class="noteHeading">Highlight(<span class="annotation_yellow">yellow</span>) - Location 900</div>
<div class="noteText">Simplify,  simplify.</div></div>`,
    })

    await importEmail(job())

    expect(await readerClippings()).toEqual([
      expect.objectContaining({
        content: 'Simplify, simplify.',
        pageAt: '#10',
      }),
    ])
  })

  it('ignores mail sent to another address of the receiving domain', async () => {
    await expect(
      importEmail(
        job({
          to: ['support@import.clippingkk.example'],
          receivedFor: ['support@import.clippingkk.example'],
        })
      )
    ).resolves.toBe('not_addressed')
    expect(receiving.get).not.toHaveBeenCalled()
  })

  it('reads a notebook pasted into the body when nothing is attached', async () => {
    serve({}, { html: sample })

    await expect(importEmail(job())).resolves.toBe('imported')
    expect(await readerClippings()).toHaveLength(22)
  })

  it('reports an email with no notebook', async () => {
    serve({ 'Receipt.html': '<p>Thanks for your order</p>' })

    await expect(importEmail(job())).resolves.toBe('no_notebook')
    const [binding] = await db.select().from(schema.emailBindings)
    expect(binding.lastImportedAt).toBeNull()
  })
})
