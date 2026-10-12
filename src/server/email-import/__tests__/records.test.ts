// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'

import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../db', () => ({ getDatabase: vi.fn() }))

import { getDatabase } from '../../db'
import * as schema from '../../db/schema'
import type { EmailImportJob } from '../../jobs/queues'
import {
  clipText,
  emptyFacts,
  listInboundEmails,
  listUnverifiedInboundEmails,
  recordInboundEmail,
} from '../records'

const pg = new PGlite()
const db = drizzle(pg, { schema })

const READER = 1
const OTHER = 2

const job = (overrides: Partial<EmailImportJob> = {}): EmailImportJob => ({
  emailId: 'email-1',
  from: 'Reader <Reader@iCloud.com>',
  to: ['kindle@import.clippingkk.example'],
  receivedFor: [],
  subject: 'Notebook export',
  receivedAt: '2026-10-12T08:00:00.000Z',
  ...overrides,
})

beforeAll(async () => {
  for (const name of (await readdir('drizzle'))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    await pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
}, 30000)

beforeEach(async () => {
  await pg.exec('TRUNCATE inbound_emails RESTART IDENTITY')
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
})

describe('clipText', () => {
  it('drops NULs and cuts by code point', () => {
    expect(clipText('a\u0000b', 10)).toBe('ab')
    expect(clipText('📚📚📚', 2)).toBe('📚📚')
  })
})

describe('recordInboundEmail', () => {
  it('keeps one row per email, adding up what each attempt saved', async () => {
    await recordInboundEmail(
      job(),
      'retrying',
      {
        ...emptyFacts(),
        userId: READER,
        highlights: 80,
        clippingsCreated: 50,
        detail: 'connection reset',
      },
      1
    )
    // The binding is gone by the retry, which saves the remaining 30.
    await recordInboundEmail(
      job(),
      'imported',
      {
        ...emptyFacts(),
        highlights: 80,
        clippingsCreated: 30,
        notesCreated: 2,
      },
      2
    )

    expect(await db.select().from(schema.inboundEmails)).toEqual([
      expect.objectContaining({
        userId: READER,
        sender: 'reader@icloud.com',
        status: 'imported',
        detail: null,
        highlights: 80,
        clippingsCreated: 80,
        notesCreated: 2,
        attempts: 2,
      }),
    ])
  })

  it('clips a long subject and keeps the raw sender it couldn’t parse', async () => {
    await recordInboundEmail(
      job({ from: 'Nobody', subject: `${'x'.repeat(600)}\u0000` }),
      'unreadable_sender',
      emptyFacts(),
      1
    )

    const [row] = await db.select().from(schema.inboundEmails)
    expect(row.sender).toBe('Nobody')
    expect(row.subject).toBe('x'.repeat(512))
  })

  it('falls back to now when the received time doesn’t parse', async () => {
    const before = Date.now()
    await recordInboundEmail(
      job({ receivedAt: 'yesterday' }),
      'missing',
      emptyFacts(),
      1
    )

    const [row] = await db.select().from(schema.inboundEmails)
    expect(row.receivedAt.getTime()).toBeGreaterThanOrEqual(before)
  })
})

describe('listing', () => {
  async function seed(
    emailId: string,
    userId: number | null,
    receivedAt: string
  ) {
    await recordInboundEmail(
      job({ emailId, receivedAt }),
      userId ? 'failed' : 'replied',
      { ...emptyFacts(), userId, detail: userId ? 'secret internals' : null },
      1
    )
  }

  beforeEach(async () => {
    await seed('mine-old', READER, '2026-10-01T00:00:00Z')
    await seed('mine-new', READER, '2026-10-03T00:00:00Z')
    await seed('theirs', OTHER, '2026-10-02T00:00:00Z')
    await seed('stranger-old', null, '2026-10-01T00:00:00Z')
    await seed('stranger-new', null, '2026-10-04T00:00:00Z')
  })

  it('gives a reader only their own mail, newest first, without details', async () => {
    const { total, emails } = await listInboundEmails(READER, 1)

    expect(total).toBe(2)
    expect(emails).toEqual([
      expect.objectContaining({
        status: 'failed',
        detail: null,
        receivedAt: '2026-10-03T00:00:00.000Z',
      }),
    ])
  })

  it('gives administrators only mail no reader sent', async () => {
    const page = await listUnverifiedInboundEmails({ limit: 10, offset: 0 })
    expect(page.map((email) => email.receivedAt)).toEqual([
      '2026-10-04T00:00:00.000Z',
      '2026-10-01T00:00:00.000Z',
    ])

    const next = await listUnverifiedInboundEmails({ limit: 10, offset: 1 })
    expect(next).toHaveLength(1)
    expect(next[0].receivedAt).toBe('2026-10-01T00:00:00.000Z')
  })
})
