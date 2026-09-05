import { requirePremium } from '../ai/access'
import { generateAI, generateAIText } from '../ai/generate'
// @vitest-environment node
import { buildPrompt } from '../ai/prompts'
import { aiStreamResponse } from '../ai/routes'
import type { Clipping, User } from '../db/schema'
import type { GraphQLContext } from '../graphql/context'
import { resolvers } from '../graphql/resolvers'

const mocks = vi.hoisted(() => ({
  chat: vi.fn(),
  adapter: vi.fn(),
  user: vi.fn(),
  clipping: vi.fn(),
  auth: vi.fn(),
  recent: vi.fn(),
  env: { OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'test-model' },
}))
vi.mock('@tanstack/ai', async (original) => ({
  ...(await original<typeof import('@tanstack/ai')>()),
  chat: mocks.chat,
}))
vi.mock('@tanstack/ai-openai', () => ({
  createOpenaiChat: mocks.adapter,
  OPENAI_CHAT_MODELS: ['test-model'],
}))
vi.mock('../env', () => ({ getServerEnv: () => mocks.env }))
vi.mock('../auth', async (original) => ({
  ...(await original<typeof import('../auth')>()),
  optionalUserId: mocks.auth,
}))
vi.mock('../db', () => ({
  getDatabase: () => ({
    db: {
      select: () => ({
        from: () => ({
          where: () => ({ orderBy: () => ({ limit: mocks.recent }) }),
        }),
      }),
      query: {
        users: { findFirst: mocks.user },
        clippings: { findFirst: mocks.clipping },
      },
    },
  }),
}))

const context = {
  userId: 7,
  language: 'zh',
  request: new Request('http://localhost'),
  ip: '',
} as GraphQLContext
const passage = {
  kind: 'passage' as const,
  language: 'zh',
  passage: 'Words',
  book: { title: 'Book' },
}
beforeEach(() => {
  vi.clearAllMocks()
  mocks.env.OPENAI_API_KEY = 'test-key'
  mocks.env.OPENAI_MODEL = 'test-model'
  mocks.recent.mockResolvedValue([{ content: 'Quote' }])
  mocks.auth.mockResolvedValue(7)
  mocks.user.mockResolvedValue({
    id: 7,
    premiumEndAt: new Date(Date.now() + 60_000),
  })
  mocks.clipping.mockResolvedValue({
    id: 1,
    content: 'Saved passage',
    title: 'Book',
  })
  mocks.chat.mockImplementation(async function* () {
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
  })
})
afterEach(() => vi.useRealTimers())

test.each([1, 2, 3, 4])(
  'comment mode %i preserves context and language',
  (mode) => {
    const result = buildPrompt({
      kind: 'comment',
      language: 'zh',
      mode,
      comment: 'My words',
      book: 'Book',
      passage: 'Quote',
    })
    expect(result.system).toContain('Respond in zh')
    expect(result.data).toEqual({
      comment: 'My words',
      book: 'Book',
      passage: 'Quote',
    })
    expect(result.system).toContain(
      ['professional', 'Deepen', 'intriguing', 'casual'][mode - 1]
    )
  }
)
test('bounds recommendation and personality context', () => {
  const recommendations = buildPrompt({
    kind: 'recommendations',
    language: 'en',
    books: Array.from({ length: 15 }, () => ({
      title: 'Book',
      author: 'Writer',
      summary: 'a'.repeat(500),
    })),
  })
  expect(recommendations.data).toHaveLength(10)
  expect(JSON.stringify(recommendations.data)).not.toContain('a'.repeat(301))
  expect(
    buildPrompt({
      kind: 'personality',
      language: 'en',
      clippings: Array(40).fill('quote'),
    }).data
  ).toHaveLength(30)
  expect(buildPrompt(passage).data).toEqual({
    book: { title: 'Book' },
    passage: 'Words',
  })
})
test('collects streamed text and passes local prompts to TanStack', async () => {
  await expect(generateAIText(passage)).resolves.toBe('Hello world')
  expect(mocks.chat.mock.calls[0][0].systemPrompts[0]).toContain(
    'Respond in zh'
  )
})
test.each(['OPENAI_API_KEY', 'OPENAI_MODEL'] as const)(
  'missing %s fails before provider invocation',
  (key) => {
    mocks.env[key] = ''
    expect(() => generateAI(passage)).toThrow('not configured')
    expect(mocks.chat).not.toHaveBeenCalled()
  }
)
test('unsupported configured model fails before provider invocation', () => {
  mocks.env.OPENAI_MODEL = 'unknown'
  expect(() => generateAI(passage)).toThrow('unsupported')
  expect(mocks.chat).not.toHaveBeenCalled()
})
test.each([null, new Date(0), new Date()])(
  'rejects missing or expired premium: %s',
  async (premiumEndAt) => {
    mocks.user.mockResolvedValue({ premiumEndAt })
    await expect(requirePremium(7)).rejects.toMatchObject({ status: 403 })
  }
)
test('anonymous and missing users cannot generate', async () => {
  await expect(requirePremium(0)).rejects.toMatchObject({ status: 401 })
  mocks.user.mockResolvedValue(undefined)
  await expect(requirePremium(7)).rejects.toMatchObject({ status: 401 })
})
const request = (kind: string) =>
  new Request(`http://localhost/api/v2/ai/${kind}`, {
    method: 'POST',
    body: JSON.stringify({
      forwardedProps:
        kind === 'passage'
          ? {
              clippingId: 1,
              language: 'zh',
              book: { title: 'Book', author: 'Writer' },
            }
          : { language: 'zh', books: [{ title: 'Book', author: 'Writer' }] },
    }),
  })
test.each(['passage', 'recommendations'] as const)(
  '%s endpoint streams successful output',
  async (kind) => {
    const response = await aiStreamResponse(request(kind), kind)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(await response.text()).toContain('Hello')
    if (kind === 'passage')
      expect(mocks.chat.mock.calls[0][0].messages[0].content).toContain(
        'Saved passage'
      )
  }
)
test.each(['anonymous', 'free', 'expired'])(
  'every AI entry point rejects %s requesters without generating',
  async (state) => {
    mocks.auth.mockResolvedValue(state === 'anonymous' ? 0 : 7)
    mocks.user.mockResolvedValue({
      premiumEndAt: state === 'expired' ? new Date(0) : null,
    })
    const ctx = { ...context, userId: state === 'anonymous' ? 0 : 7 }
    const calls = [
      () => aiStreamResponse(request('passage'), 'passage'),
      () => aiStreamResponse(request('recommendations'), 'recommendations'),
      () =>
        resolvers.Mutation.aiEnhanceComment(
          {},
          { promptId: 1, content: 'Comment' },
          ctx
        ),
      () => resolvers.Clipping.aiSummary({ id: 1 } as Clipping, {}, ctx),
      () => resolvers.User.personalityByAI({ id: 99 } as User, {}, ctx),
    ]
    for (const call of calls)
      await expect(call()).rejects.toMatchObject({
        status: state === 'anonymous' ? 401 : 403,
      })
    expect(mocks.chat).not.toHaveBeenCalled()
  }
)
test('GraphQL preserves comment and summary response shapes', async () => {
  await expect(
    resolvers.Mutation.aiEnhanceComment(
      {},
      { promptId: 1, content: 'Comment', clippingId: 1 },
      context
    )
  ).resolves.toEqual({ content: 'Hello world' })
  await expect(
    resolvers.Clipping.aiSummary(
      { id: 1, title: 'Book', content: 'Quote' } as Clipping,
      {},
      context
    )
  ).resolves.toBe('Hello world')
})
test('unavailable clipping and malformed payload never call the provider', async () => {
  mocks.clipping.mockResolvedValue(undefined)
  await expect(
    aiStreamResponse(request('passage'), 'passage')
  ).rejects.toMatchObject({ status: 404 })
  await expect(
    aiStreamResponse(
      new Request('http://localhost', { method: 'POST', body: '{}' }),
      'recommendations'
    )
  ).rejects.toMatchObject({ status: 400 })
  expect(mocks.chat).not.toHaveBeenCalled()
})
test('partial failures produce a stream error; GraphQL summary retains empty fallback', async () => {
  mocks.chat.mockImplementation(async function* () {
    yield { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: 'partial' }
    throw new Error('upstream private details')
  })
  const response = await aiStreamResponse(request('passage'), 'passage')
  const body = await response.text()
  expect(body).toContain('RUN_ERROR')
  expect(body).not.toContain('upstream private details')
  await expect(
    resolvers.Clipping.aiSummary(
      { id: 1, title: 'Book', content: 'Quote' } as Clipping,
      {},
      context
    )
  ).resolves.toBe('')
})
test('timeout aborts provider generation', async () => {
  vi.useFakeTimers()
  mocks.chat.mockImplementation(async function* ({ abortController }) {
    await new Promise<void>((resolve) =>
      abortController.signal.addEventListener('abort', () => resolve(), {
        once: true,
      })
    )
    yield* []
  })
  const result = generateAIText(passage)
  const assertion = expect(result).rejects.toThrow('AI generation failed')
  await vi.advanceTimersByTimeAsync(120_000)
  await assertion
})
test('request cancellation reaches the provider', async () => {
  const controller = new AbortController()
  mocks.chat.mockImplementation(async function* ({ abortController }) {
    controller.abort()
    expect(abortController.signal.aborted).toBe(true)
    yield* []
  })
  await expect(generateAIText(passage, controller.signal)).rejects.toThrow()
})

test('personality preserves success, empty-history and provider-failure results', async () => {
  await expect(
    resolvers.User.personalityByAI({ id: 99 } as User, {}, context)
  ).resolves.toBe('Hello world')
  expect(mocks.recent).toHaveBeenCalledWith(30)
  mocks.recent.mockResolvedValue([])
  mocks.chat.mockClear()
  await expect(
    resolvers.User.personalityByAI({ id: 99 } as User, {}, context)
  ).resolves.toBe('')
  expect(mocks.chat).not.toHaveBeenCalled()
  mocks.recent.mockResolvedValue([{ content: 'Quote' }])
  mocks.chat.mockImplementation(() => {
    throw new Error('Provider failed')
  })
  await expect(
    resolvers.User.personalityByAI({ id: 99 } as User, {}, context)
  ).resolves.toBe('')
})
