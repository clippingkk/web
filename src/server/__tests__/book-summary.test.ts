// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'

import { PGlite } from '@electric-sql/pglite'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  chat: vi.fn(),
  auth: vi.fn(),
  isPremium: vi.fn(),
  cache: new Map<string, { fingerprint: string; text: string }>(),
}))
const getDatabase = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/ai', async (original) => ({
  ...(await original<typeof import('@tanstack/ai')>()),
  chat: mocks.chat,
}))
vi.mock('@tanstack/ai-openai', () => ({
  createOpenaiChat: vi.fn(),
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
  cacheSet: async (
    key: string,
    value: { fingerprint: string; text: string }
  ) => {
    mocks.cache.set(key, value)
  },
}))

import { highlightLanguage, sampleHighlights } from '../ai/book-highlights'
import { cachedBookSummary } from '../ai/book-summary'
import { buildPrompt } from '../ai/prompts'
import { aiStreamResponse } from '../ai/routes'
import * as schema from '../db/schema'

const READER = 7
const OTHER = 8
const BOOK = '24601'

const pg = new PGlite()
const db = drizzle(pg, { schema })

function succeed() {
  return (async function* () {
    yield { type: 'RUN_STARTED', threadId: 't', runId: 'r' }
    yield { type: 'TEXT_MESSAGE_START', messageId: 'm', role: 'assistant' }
    yield { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: 'Hello' }
    yield { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: ' world' }
    yield { type: 'TEXT_MESSAGE_END', messageId: 'm' }
    yield {
      type: 'RUN_FINISHED',
      threadId: 't',
      runId: 'r',
      usage: [{ inputTokens: 4, outputTokens: 2 }],
    }
  })()
}

function request(body: unknown) {
  return new Request('http://localhost/api/v2/ai/book', {
    method: 'POST',
    body: JSON.stringify({ forwardedProps: body }),
  })
}

function promptOf() {
  const call = mocks.chat.mock.calls.at(-1)?.[0]
  return {
    system: String(call.systemPrompts[0]),
    data: JSON.parse(String(call.messages[0].content)) as {
      highlights: string[]
      book: { title: string; author: string }
    },
  }
}

beforeAll(async () => {
  for (const name of (await readdir('drizzle'))
    .filter((file) => file.endsWith('.sql'))
    .sort())
    await pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
}, 30_000)

beforeEach(async () => {
  await pg.exec('TRUNCATE users, clippings RESTART IDENTITY')
  getDatabase.mockReturnValue({ db })
  mocks.cache.clear()
  mocks.chat.mockReset()
  mocks.chat.mockImplementation(succeed)
  mocks.auth.mockResolvedValue(READER)
  mocks.isPremium.mockResolvedValue(true)
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
      Array.from({ length: 100 }, (_, index) =>
        index === 0 ? `start ${'📚'.repeat(500)}` : `h${index}`
      )
    )
    expect(sampled).toHaveLength(40)
    expect(sampled[0]?.startsWith('start ')).toBe(true)
    expect(Array.from(sampled[0] ?? '')).toHaveLength(300)
    expect(sampled.at(-1)).toBe('h99')
    expect(sampled.join('').length).toBeLessThanOrEqual(12_000)
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
  })

  test('caps book prompt input and asks for the highlights language', () => {
    const result = buildPrompt({
      kind: 'book',
      language: 'Chinese',
      book: { title: 'T'.repeat(500), author: 'A'.repeat(500) },
      highlights: Array.from({ length: 80 }, () => '字'.repeat(1000)),
    })
    expect(result.system).toContain('Respond in Chinese')
    expect(result.system).toContain('language of the highlights')
    const data = result.data as {
      highlights: string[]
      book: { title: string; author: string }
    }
    expect(data.highlights.length).toBeGreaterThan(0)
    expect(data.highlights.length).toBeLessThanOrEqual(40)
    expect(
      data.highlights.every((item) => Array.from(item).length <= 400)
    ).toBe(true)
    expect(data.highlights.join('').length).toBeLessThanOrEqual(12_000)
    expect(data.book).toEqual({
      title: 'T'.repeat(300),
      author: 'A'.repeat(300),
    })
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

  test('samples the signed-in reader’s own highlights and answers in their language', async () => {
    await seedLongBook()
    const response = await aiStreamResponse(
      request({
        bookId: BOOK,
        title: '瓦尔登湖',
        author: '梭罗',
        language: 'en',
      }),
      'book'
    )
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(await response.text()).toContain('Hello')
    const { system, data } = promptOf()
    expect(system).toContain('Respond in Chinese')
    expect(system).not.toContain('Respond in en')
    expect(data.highlights.length).toBeLessThanOrEqual(40)
    expect(data.highlights[0]).toContain('H000-START')
    expect(Array.from(data.highlights[0] ?? '')).toHaveLength(300)
    expect(data.highlights.at(-1)).toBe('H079-END')
    expect(data.highlights.join('')).not.toContain('SECRET-OTHER')
    expect(data.highlights.join('')).not.toContain('DELETED-SECRET')
    expect(data.highlights.join('')).not.toContain('OTHER-BOOK')
    const serialized = JSON.stringify(data)
    expect(serialized.length).toBeLessThanOrEqual(20_000)

    mocks.chat.mockClear()
    mocks.auth.mockResolvedValue(OTHER)
    await (
      await aiStreamResponse(
        request({ bookId: BOOK, title: '瓦尔登湖', author: '梭罗' }),
        'book'
      )
    ).text()
    expect(promptOf().data.highlights).toEqual(['SECRET-OTHER'])
  })

  test('replays a stored summary until the highlights change, unless asked again', async () => {
    const [row] = await db
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
    const body = { bookId: BOOK, title: 'Walden', author: 'Thoreau' }
    const first = await (await aiStreamResponse(request(body), 'book')).text()
    expect(first).toContain('"delta":"Hello"')
    expect(first).toContain('"delta":" world"')
    await expect(
      cachedBookSummary(READER, BOOK, { title: 'Walden', author: 'Thoreau' })
    ).resolves.toBe('Hello world')
    expect(mocks.chat).toHaveBeenCalledTimes(1)

    mocks.chat.mockClear()
    expect(
      await (await aiStreamResponse(request(body), 'book')).text()
    ).toContain('Hello world')
    expect(mocks.chat).not.toHaveBeenCalled()

    mocks.chat.mockClear()
    expect(
      await (
        await aiStreamResponse(request({ ...body, force: true }), 'book')
      ).text()
    ).toContain('Hello')
    expect(mocks.chat).toHaveBeenCalledTimes(1)

    await db
      .update(schema.clippings)
      .set({ content: 'A different sentence about the rain.' })
      .where(eq(schema.clippings.id, row.id))
    mocks.chat.mockClear()
    await (await aiStreamResponse(request(body), 'book')).text()
    expect(mocks.chat).toHaveBeenCalledTimes(1)
    await expect(
      cachedBookSummary(READER, BOOK, { title: 'Walden', author: 'Someone' })
    ).resolves.toBeNull()
  })

  test('a failed generation is not cached and hides provider details', async () => {
    await db.insert(schema.clippings).values({
      title: 'Walden',
      content: 'I wished to live deliberately.',
      bookId: BOOK,
      dataId: 'a',
      createdBy: READER,
    })
    mocks.chat.mockImplementation(async function* () {
      yield { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: 'partial' }
      throw new Error('upstream private details')
    })
    const body = await (
      await aiStreamResponse(
        request({ bookId: BOOK, title: 'Walden', author: 'Thoreau' }),
        'book'
      )
    ).text()
    expect(body).toContain('RUN_ERROR')
    expect(body).not.toContain('upstream private details')

    mocks.chat.mockImplementation(succeed)
    mocks.chat.mockClear()
    expect(
      await (
        await aiStreamResponse(
          request({ bookId: BOOK, title: 'Walden', author: 'Thoreau' }),
          'book'
        )
      ).text()
    ).toContain('Hello')
    expect(mocks.chat).toHaveBeenCalledTimes(1)
  })

  test('an empty book and a rejected reader never call the model', async () => {
    await expect(
      aiStreamResponse(
        request({ bookId: BOOK, title: 'Walden', author: 'Thoreau' }),
        'book'
      )
    ).rejects.toMatchObject({ status: 404 })

    mocks.isPremium.mockResolvedValue(false)
    await expect(
      aiStreamResponse(
        request({ bookId: BOOK, title: 'Walden', author: 'Thoreau' }),
        'book'
      )
    ).rejects.toMatchObject({ status: 403, code: 'PREMIUM_REQUIRED' })

    mocks.auth.mockResolvedValue(0)
    await expect(
      aiStreamResponse(
        request({ bookId: BOOK, title: 'Walden', author: 'Thoreau' }),
        'book'
      )
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
    expect(mocks.chat).not.toHaveBeenCalled()
  })
})
