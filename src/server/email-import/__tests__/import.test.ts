// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { asc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { receiving, wenquRequest } = vi.hoisted(() => ({
  receiving: {
    get: vi.fn(),
    attachments: { list: vi.fn() },
  },
  wenquRequest: vi.fn(),
}))
vi.mock('../../db', () => ({ getDatabase: vi.fn() }))
vi.mock('../../redis', () => ({ cacheDelete: vi.fn(async () => {}) }))
vi.mock('../../integrations', () => ({
  getResend: () => ({ emails: { receiving } }),
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
    data: { id: job().emailId, headers, html, attachments: [] },
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

  it('only logs mail from an address no reader has verified', async () => {
    serve({ 'Notebook.html': sample })

    await expect(
      importEmail(job({ from: 'Stranger <stranger@example.com>' }))
    ).resolves.toBe('unbound_sender')

    expect(await readerClippings()).toEqual([])
    expect(receiving.get).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('sender is not bound')
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('s***@example.com')
    )
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
