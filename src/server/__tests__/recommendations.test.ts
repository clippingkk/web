// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { AI_CONTEXT_EVENT, type RecommendationsContext } from '@/lib/ai/schemas'

import {
  aiRequest,
  fakeAdapter,
  promptData,
  promptSystem,
  reply,
  sseEvents,
  type FakeReply,
} from './fake-ai-adapter'

const mocks = vi.hoisted(() => ({
  createAdapter: vi.fn(),
  auth: vi.fn(),
  isPremium: vi.fn(),
  wenqu: vi.fn(),
  cache: new Map<string, unknown>(),
}))
const getDatabase = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/ai-openai', () => ({
  createOpenaiChat: mocks.createAdapter,
  OPENAI_CHAT_MODELS: ['test-model'],
}))
vi.mock('../env', () => ({
  getServerEnv: () => ({
    OPENAI_API_KEY: 'test-key',
    OPENAI_MODEL: 'test-model',
  }),
}))
vi.mock('../billing/premium', () => ({ isPremium: mocks.isPremium }))
vi.mock('../auth', async (original) => ({
  ...(await original<typeof import('../auth')>()),
  optionalUserId: mocks.auth,
}))
vi.mock('../db', () => ({ getDatabase }))
vi.mock('../redis', () => ({
  cacheGet: async (key: string) => mocks.cache.get(key),
  cacheSet: async (key: string, value: unknown) => {
    mocks.cache.set(key, value)
  },
}))
vi.mock('@/services/wenqu', async (original) => ({
  ...(await original<typeof import('@/services/wenqu')>()),
  wenquRequest: mocks.wenqu,
}))

import { aiStreamResponse } from '../ai/routes'
import { migratePglite } from '../db/__tests__/pglite'
import * as schema from '../db/schema'

const READER = 7
const OTHER = 8

function listOf(...titles: string[]) {
  return {
    portrait: 'You want a quieter life.',
    picks: titles.map((title) => ({
      title,
      author: 'A Writer',
      kind: 'deeper',
      hook: 'A hook.',
      why: 'A reason.',
      shelfRef: 1,
    })),
  }
}

const pg = new PGlite()
const db = drizzle(pg, { schema })

let scripted: FakeReply
let harness: ReturnType<typeof fakeAdapter>

type ShelfPrompt = {
  shelf: {
    ref: number
    title: string
    author?: string
    tags?: string[]
    highlightCount: number
    highlights: string[]
  }[]
  alreadyRead: string[]
  avoid: string[]
}

const lastPrompt = () => promptData<ShelfPrompt>(harness.calls.at(-1)!)
const ask = (input: object = {}) =>
  aiStreamResponse(aiRequest('recommendations', input), 'recommendations')

let row = 0
function clipping(
  title: string,
  content: string,
  overrides: Partial<typeof schema.clippings.$inferInsert> = {}
) {
  row += 1
  return {
    title,
    content,
    bookId: '0',
    dataId: `row-${row}`,
    createdBy: READER,
    ...overrides,
  }
}

beforeAll(async () => {
  await migratePglite(pg)
}, 30_000)

beforeEach(async () => {
  await pg.exec('TRUNCATE users, clippings RESTART IDENTITY')
  getDatabase.mockReturnValue({ db })
  mocks.cache.clear()
  scripted = reply(listOf('One', 'Two', 'Three'))
  harness = fakeAdapter(() => scripted)
  mocks.createAdapter.mockImplementation(() => harness.adapter)
  mocks.auth.mockResolvedValue(READER)
  mocks.isPremium.mockResolvedValue(true)
  mocks.wenqu.mockResolvedValue({ books: [] })
  await db.insert(schema.users).values([
    {
      id: READER,
      name: 'Reader',
      email: 'reader@example.com',
      pwd: '',
      checked: true,
    },
    {
      id: OTHER,
      name: 'Other',
      email: 'other@example.com',
      pwd: '',
      checked: true,
    },
  ])
})

describe('recommendations', () => {
  test('work from the reader’s own shelf, ignoring anything the client sends', async () => {
    await db.insert(schema.clippings).values([
      clipping('Older Book', 'An older highlight.', { bookId: '1111' }),
      clipping('Walden', 'I wished to live deliberately.', {
        bookId: '2222',
      }),
      clipping('Walden', 'Simplify, simplify.', { bookId: '2222' }),
      clipping('Gone', 'DELETED-SECRET', { deletedAt: new Date(0) }),
      clipping('Theirs', 'OTHER-READER-SECRET', { createdBy: OTHER }),
    ])
    mocks.wenqu.mockResolvedValue({
      books: [
        {
          doubanId: 2222,
          title: '瓦尔登湖',
          author: '梭罗',
          tags: ['哲学', '自然'],
        },
      ],
    })

    await (
      await ask({
        language: 'zhCN',
        books: [{ title: 'INJECTED-BOOK', author: 'Someone' }],
      })
    ).text()

    const prompt = lastPrompt()
    expect(prompt.shelf.map(({ title }) => title)).toEqual([
      '瓦尔登湖',
      'Older Book',
    ])
    expect(prompt.shelf[0]).toMatchObject({
      ref: 1,
      author: '梭罗',
      tags: ['哲学', '自然'],
      highlightCount: 2,
    })
    expect(prompt.shelf[0].highlights).toHaveLength(2)
    expect(prompt.alreadyRead).toEqual(['Walden', 'Older Book'])
    expect(prompt.avoid).toEqual([])

    const sent = JSON.stringify(prompt)
    expect(sent).not.toContain('DELETED-SECRET')
    expect(sent).not.toContain('OTHER-READER-SECRET')
    expect(sent).not.toContain('INJECTED-BOOK')
    expect(promptSystem(harness.calls.at(-1)!)).toContain('Simplified Chinese')
  })

  test('keep unmatched books apart, and keep each book’s input small', async () => {
    await db
      .insert(schema.clippings)
      .values(
        Array.from({ length: 30 }, (_, index) =>
          clipping(index % 2 ? 'Unmatched A' : 'Unmatched B', 'x'.repeat(500))
        )
      )
    await (await ask()).text()
    const { shelf } = lastPrompt()
    expect(shelf.map(({ title }) => title).toSorted()).toEqual([
      'Unmatched A',
      'Unmatched B',
    ])
    for (const book of shelf) {
      expect(book.highlightCount).toBe(15)
      expect(book.highlights).toHaveLength(3)
      expect(book.highlights[0].length).toBe(180)
    }
    expect(mocks.wenqu).not.toHaveBeenCalled()
  })

  test('send the shelf behind each ref, so a pick can link to its book', async () => {
    await db
      .insert(schema.clippings)
      .values([clipping('Walden', 'A line.', { bookId: '2222' })])
    const events = await sseEvents(await ask())
    expect(events[1].name).toBe(AI_CONTEXT_EVENT)
    expect((events[1].value as RecommendationsContext).shelf).toEqual([
      { ref: 1, title: 'Walden', bookId: '2222' },
    ])
  })

  test('opening again replays the list instead of billing again', async () => {
    await db.insert(schema.clippings).values([clipping('Walden', 'A line.')])
    await (await ask()).text()
    expect(harness.calls).toHaveLength(1)

    const replayed = await sseEvents(await ask())
    expect(harness.calls).toHaveLength(1)
    expect(replayed.map(({ type, name }) => name ?? type)).toContain(
      'structured-output.complete'
    )
  })

  test('another highlight keeps the list, a new book changes it', async () => {
    await db.insert(schema.clippings).values([clipping('Walden', 'A line.')])
    await (await ask()).text()

    await db.insert(schema.clippings).values([clipping('Walden', 'Another.')])
    await (await ask()).text()
    expect(harness.calls).toHaveLength(1)

    await db.insert(schema.clippings).values([clipping('Middlemarch', 'New.')])
    await (await ask()).text()
    expect(harness.calls).toHaveLength(2)
  })

  test('asking again avoids the books just suggested', async () => {
    await db.insert(schema.clippings).values([clipping('Walden', 'A line.')])
    await (await ask()).text()

    scripted = reply(listOf('Four', 'Five', 'Six'))
    await (await ask({ force: true })).text()
    expect(lastPrompt().avoid).toEqual(['One', 'Two', 'Three'])

    await (await ask({ force: true })).text()
    expect(lastPrompt().avoid).toEqual(['Four', 'Five', 'Six'])
  })

  test('each language keeps its own list', async () => {
    await db.insert(schema.clippings).values([clipping('Walden', 'A line.')])
    await (await ask({ language: 'en' })).text()
    await (await ask({ language: 'ko' })).text()
    expect(harness.calls).toHaveLength(2)
    expect(promptSystem(harness.calls.at(-1)!)).toContain('Korean')
  })

  test('a broken Wenqu still produces a list', async () => {
    await db
      .insert(schema.clippings)
      .values([clipping('Walden', 'A line.', { bookId: '2222' })])
    mocks.wenqu.mockRejectedValue(new Error('offline'))
    const body = await (await ask()).text()
    expect(body).toContain('structured-output.complete')
    expect(lastPrompt().shelf[0].title).toBe('Walden')
  })

  test('a failure while preparing the prompt tells the reader nothing about why', async () => {
    await db.insert(schema.clippings).values([clipping('Walden', 'A line.')])
    // The access check and the library load, then the database goes away.
    getDatabase
      .mockReturnValueOnce({ db })
      .mockReturnValueOnce({ db })
      .mockImplementation(() => {
        throw new Error('connection to secret-host.internal failed')
      })
    const body = await (await ask()).text()
    expect(body).toContain('RUN_ERROR')
    expect(body).toContain('AI_GENERATION_FAILED')
    expect(body).not.toContain('secret-host')
    expect(harness.calls).toHaveLength(0)
    expect(mocks.cache.size).toBe(0)
  })

  test('a reader with no highlights never reaches the model', async () => {
    await expect(ask()).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    })
    expect(harness.calls).toHaveLength(0)
  })
})
