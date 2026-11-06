// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { AI_CONTEXT_EVENT, type BookSummaryContext } from '@/lib/ai/schemas'

import {
  aiRequest,
  fakeAdapter,
  promptData,
  promptSystem,
  providerError,
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

import {
  clipChars,
  evenIndexes,
  highlightLanguage,
  sampleHighlights,
} from '../ai/book-highlights'
import { cachedBookSummary } from '../ai/book-summary'
import { aiStreamResponse } from '../ai/routes'
import { migratePglite } from '../db/__tests__/pglite'
import * as schema from '../db/schema'

const READER = 7
const OTHER = 8
const BOOK = '24601'
const SUMMARY = {
  thesis: 'A deliberate life begins with subtraction.',
  themes: [
    { title: 'Subtraction', insight: 'Less is the method.', highlightRef: 1 },
  ],
  question: 'What would you give up first?',
}

const pg = new PGlite()
const db = drizzle(pg, { schema })

let scripted: FakeReply
let harness: ReturnType<typeof fakeAdapter>

type PromptData = {
  title: string
  author: string
  highlights: { ref: number; text: string }[]
}

const request = (body: unknown) => aiRequest('book', body)
const lastPrompt = () => promptData<PromptData>(harness.calls.at(-1)!)

beforeAll(async () => {
  // PGlite cannot load PGroonga; the shared helper skips those statements.
  await migratePglite(pg)
}, 30_000)

beforeEach(async () => {
  await pg.exec('TRUNCATE users, clippings RESTART IDENTITY')
  getDatabase.mockReturnValue({ db })
  mocks.cache.clear()
  scripted = reply(SUMMARY)
  harness = fakeAdapter(() => scripted)
  mocks.createAdapter.mockImplementation(() => harness.adapter)
  mocks.auth.mockResolvedValue(READER)
  mocks.isPremium.mockResolvedValue(true)
  mocks.wenqu.mockResolvedValue({
    books: [{ doubanId: Number(BOOK), title: '瓦尔登湖', author: '梭罗' }],
  })
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

describe('highlight shaping', () => {
  test('spreads a long book from the first highlight to the last and trims each one', () => {
    const sampled = sampleHighlights(
      Array.from({ length: 100 }, (_, index) => ({
        id: index + 1000,
        content: index === 0 ? `start ${'📚'.repeat(500)}` : `h${index}`,
      }))
    )
    expect(sampled).toHaveLength(40)
    expect(sampled[0]).toMatchObject({ ref: 1, id: 1000 })
    expect(sampled[0].text.startsWith('start ')).toBe(true)
    expect(Array.from(sampled[0].text)).toHaveLength(300)
    expect(sampled.at(-1)).toMatchObject({ ref: 40, id: 1099, text: 'h99' })
    expect(sampled.map(({ text }) => text).join('').length).toBeLessThanOrEqual(
      12_000
    )
  })

  test('never splits a character a reader sees as one', () => {
    expect(clipChars('👍🏽👨‍👩‍👧é', 2)).toBe('👍🏽👨‍👩‍👧')
    expect(clipChars('short', 100)).toBe('short')
  })

  test('picks evenly and never repeats', () => {
    expect(evenIndexes(0, 3)).toEqual([])
    expect(evenIndexes(2, 3)).toEqual([0, 1])
    expect(evenIndexes(9, 1)).toEqual([0])
    expect(evenIndexes(100, 3)).toEqual([0, 50, 99])
    const many = evenIndexes(1000, 40)
    expect(new Set(many).size).toBe(40)
  })

  test('names the highlight language and leaves Latin text to the model', () => {
    expect(highlightLanguage(['读者在安静的房间里把这句话留了下来'])).toBe(
      'Chinese'
    )
    expect(highlightLanguage(['これは静かな本の一節です'])).toBe('Japanese')
    expect(highlightLanguage(['독자가 조용히 남겨 둔 문장입니다'])).toBe(
      'Korean'
    )
    expect(highlightLanguage(['Тихая фраза из книги'])).toBe('Russian')
    expect(highlightLanguage(['جملة هادئة من الكتاب'])).toBe('Arabic')
    expect(
      highlightLanguage(['A quiet sentence kept from the middle of the book'])
    ).toBe('the language of the highlights')
    expect(highlightLanguage(['读者の句子'])).toBe('Chinese')
    expect(highlightLanguage(['12345 !!!'])).toBe(
      'the language of the highlights'
    )
  })
})

describe('book summary stream', () => {
  async function seedLongBook() {
    await db.insert(schema.clippings).values([
      ...Array.from({ length: 80 }, (_, index) => ({
        title: 'Walden',
        content:
          index === 10
            ? '   '
            : index === 7
              ? 'DELETED-SECRET'
              : index === 0
                ? `H000-START ${'字'.repeat(500)}`
                : index === 79
                  ? 'H079-END'
                  : `H${String(index).padStart(3, '0')}`,
        bookId: BOOK,
        dataId: `reader-${index}`,
        createdBy: READER,
        visible: index !== 0,
        deletedAt: index === 7 ? new Date('2020-01-01T00:00:00Z') : null,
      })),
      {
        title: 'Walden',
        content: 'SECRET-OTHER',
        bookId: BOOK,
        dataId: 'other-reader',
        createdBy: OTHER,
        visible: true,
      },
      {
        title: 'Other',
        content: 'OTHER-BOOK',
        bookId: '999',
        dataId: 'other-book',
        createdBy: READER,
        visible: true,
      },
    ])
  }

  async function seedShortBook() {
    return db
      .insert(schema.clippings)
      .values([
        {
          title: 'Walden',
          content: 'I went to the woods because I wished to live deliberately.',
          bookId: BOOK,
          dataId: 'a',
          createdBy: READER,
        },
        {
          title: 'Walden',
          content: 'The mass of men lead lives of quiet desperation.',
          bookId: BOOK,
          dataId: 'b',
          createdBy: READER,
        },
      ])
      .returning()
  }

  test('samples the signed-in reader’s own highlights, numbered, in their language', async () => {
    await seedLongBook()
    const response = await aiStreamResponse(
      request({ bookId: BOOK, title: 'INJECTED', language: 'en' }),
      'book'
    )
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    await response.text()

    const prompt = lastPrompt()
    const texts = prompt.highlights.map(({ text }) => text)
    expect(prompt.title).toBe('瓦尔登湖')
    expect(prompt.author).toBe('梭罗')
    expect(texts.length).toBeLessThanOrEqual(40)
    expect(prompt.highlights[0].ref).toBe(1)
    expect(texts[0]).toContain('H000-START')
    expect(Array.from(texts[0])).toHaveLength(300)
    expect(texts.at(-1)).toBe('H079-END')
    const joined = texts.join('')
    expect(joined).not.toContain('SECRET-OTHER')
    expect(joined).not.toContain('DELETED-SECRET')
    expect(joined).not.toContain('OTHER-BOOK')
    expect(JSON.stringify(prompt)).not.toContain('INJECTED')
    expect(JSON.stringify(prompt).length).toBeLessThanOrEqual(20_000)
    // The sample is mostly the Chinese of H000, whatever language the UI is in.
    expect(promptSystem(harness.calls.at(-1)!)).toContain(
      'Write every value in Chinese'
    )

    mocks.auth.mockResolvedValue(OTHER)
    await (await aiStreamResponse(request({ bookId: BOOK }), 'book')).text()
    expect(lastPrompt().highlights).toEqual([{ ref: 1, text: 'SECRET-OTHER' }])
  })

  test('falls back to the clipping title when Wenqu is down', async () => {
    await seedShortBook()
    mocks.wenqu.mockRejectedValue(new Error('offline'))
    await (await aiStreamResponse(request({ bookId: BOOK }), 'book')).text()
    expect(lastPrompt()).toMatchObject({ title: 'Walden', author: '' })
  })

  test('sends the highlights behind each ref before the model’s first word', async () => {
    const [first] = await seedShortBook()
    const events = await sseEvents(
      await aiStreamResponse(request({ bookId: BOOK }), 'book')
    )
    expect(events[0].type).toBe('RUN_STARTED')
    expect(events[1].name).toBe(AI_CONTEXT_EVENT)
    const context = events[1].value as BookSummaryContext
    expect(context.total).toBe(2)
    expect(context.highlights[0]).toEqual({
      ref: 1,
      id: first.id,
      text: first.content,
    })
  })

  test('replays a stored summary until the highlights change, unless asked again', async () => {
    const [row] = await seedShortBook()
    const body = { bookId: BOOK }
    const events = await sseEvents(
      await aiStreamResponse(request(body), 'book')
    )
    expect(
      events.some(({ type }) => type === 'TEXT_MESSAGE_CONTENT')
    ).toBeTruthy()
    const stored = await cachedBookSummary(READER, BOOK)
    expect(stored?.object).toEqual(SUMMARY)
    expect(stored?.context.total).toBe(2)
    expect(harness.calls).toHaveLength(1)

    const replayed = await sseEvents(
      await aiStreamResponse(request(body), 'book')
    )
    expect(harness.calls).toHaveLength(1)
    expect(replayed.map(({ type, name }) => name ?? type)).toEqual([
      'RUN_STARTED',
      AI_CONTEXT_EVENT,
      'structured-output.start',
      'structured-output.complete',
      'RUN_FINISHED',
    ])

    await (
      await aiStreamResponse(request({ ...body, force: true }), 'book')
    ).text()
    expect(harness.calls).toHaveLength(2)

    await db
      .update(schema.clippings)
      .set({ content: 'A different sentence about the rain.' })
      .where(eq(schema.clippings.id, row.id))
    await expect(cachedBookSummary(READER, BOOK)).resolves.toBeNull()
    await (await aiStreamResponse(request(body), 'book')).text()
    expect(harness.calls).toHaveLength(3)
  })

  test('a result that no longer fits the schema counts as a miss', async () => {
    await seedShortBook()
    await (await aiStreamResponse(request({ bookId: BOOK }), 'book')).text()
    const [key] = mocks.cache.keys()
    mocks.cache.set(key, {
      ...(mocks.cache.get(key) as object),
      object: { thesis: 'An old shape' },
    })
    await expect(cachedBookSummary(READER, BOOK)).resolves.toBeNull()
  })

  test('a failed generation is not stored and hides provider details', async () => {
    await seedShortBook()
    scripted = providerError('upstream private details')
    const body = await (
      await aiStreamResponse(request({ bookId: BOOK }), 'book')
    ).text()
    expect(body).toContain('RUN_ERROR')
    expect(body).not.toContain('upstream private details')
    expect(mocks.cache.size).toBe(0)

    scripted = reply(SUMMARY)
    await (await aiStreamResponse(request({ bookId: BOOK }), 'book')).text()
    expect(harness.calls).toHaveLength(2)
    expect(mocks.cache.size).toBe(1)
  })

  test('a broken cache costs a regeneration, never the result', async () => {
    await seedShortBook()
    const redis = await import('../redis')
    const read = vi
      .spyOn(redis, 'cacheGet')
      .mockRejectedValue(new Error('down'))
    const write = vi
      .spyOn(redis, 'cacheSet')
      .mockRejectedValue(new Error('down'))
    const body = await (
      await aiStreamResponse(request({ bookId: BOOK }), 'book')
    ).text()
    expect(body).toContain('structured-output.complete')
    read.mockRestore()
    write.mockRestore()
  })

  test('an empty book and a rejected reader never call the model', async () => {
    await expect(
      aiStreamResponse(request({ bookId: BOOK }), 'book')
    ).rejects.toMatchObject({ status: 404 })

    mocks.isPremium.mockResolvedValue(false)
    await expect(
      aiStreamResponse(request({ bookId: BOOK }), 'book')
    ).rejects.toMatchObject({ status: 403, code: 'PREMIUM_REQUIRED' })

    mocks.auth.mockResolvedValue(0)
    await expect(
      aiStreamResponse(request({ bookId: BOOK }), 'book')
    ).rejects.toMatchObject({ status: 401 })

    mocks.auth.mockResolvedValue(READER)
    mocks.isPremium.mockResolvedValue(true)
    await expect(
      aiStreamResponse(request({ bookId: 'nope' }), 'book')
    ).rejects.toMatchObject({ status: 400 })
    await expect(
      aiStreamResponse(
        new Request('http://localhost/api/v2/ai/book', {
          method: 'POST',
          body: '{}',
        }),
        'book'
      )
    ).rejects.toMatchObject({ status: 400 })
    expect(harness.calls).toHaveLength(0)
  })
})
