import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'

import { AI_CONTEXT_EVENT, bookSummarySchema } from '@/lib/ai/schemas'

import { useAIObject } from '../use-ai-object'

vi.mock('@/services/ajax', () => ({ resolveApiBase: () => '' }))

const SUMMARY = {
  thesis: 'A deliberate life begins with subtraction.',
  themes: [{ title: 'Subtraction', insight: 'Less.', highlightRef: 1 }],
  question: 'What would you give up?',
}
const CONTEXT = {
  total: 1,
  highlights: [{ ref: 1, id: 42, text: 'Simplify, simplify.' }],
}

const encoder = new TextEncoder()
const sse = (value: unknown) =>
  encoder.encode(`data: ${JSON.stringify(value)}\n\n`)

type Pending = {
  url: string
  body: { forwardedProps: Record<string, unknown>; threadId: string }
  signal: AbortSignal
  send: (value: unknown) => void
  close: () => void
}
let requests: Pending[]

beforeEach(() => {
  requests = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options) => {
      let controller!: ReadableStreamDefaultController<Uint8Array>
      const stream = new ReadableStream<Uint8Array>({
        start(value) {
          controller = value
        },
      })
      requests.push({
        url,
        body: JSON.parse(options.body),
        signal: options.signal,
        send: (value) => controller.enqueue(sse(value)),
        close: () => controller.close(),
      })
      return new Response(stream)
    })
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function setup(initial: Parameters<typeof useAIObject>[0]['initial'] = null) {
  return renderHook(
    () =>
      useAIObject<typeof bookSummarySchema, typeof CONTEXT>({
        kind: 'book',
        schema: bookSummarySchema,
        threadId: 'book-summary:42',
        initial: initial as never,
      }),
    { wrapper: StrictMode }
  )
}

const started = (request: Pending) => {
  request.send({ type: 'RUN_STARTED', threadId: 't', runId: 'r' })
  request.send({ type: 'CUSTOM', name: AI_CONTEXT_EVENT, value: CONTEXT })
}
const startText = (request: Pending) => {
  request.send({
    type: 'CUSTOM',
    name: 'structured-output.start',
    value: { messageId: 'm' },
  })
  request.send({
    type: 'TEXT_MESSAGE_START',
    messageId: 'm',
    role: 'assistant',
  })
}
const complete = (request: Pending) => {
  request.send({ type: 'TEXT_MESSAGE_END', messageId: 'm' })
  request.send({
    type: 'CUSTOM',
    name: 'structured-output.complete',
    value: { object: SUMMARY, raw: JSON.stringify(SUMMARY), messageId: 'm' },
  })
  request.send({
    type: 'RUN_FINISHED',
    threadId: 't',
    runId: 'r',
    finishReason: 'stop',
  })
  request.close()
}

it('sends nothing until asked, even in Strict Mode', async () => {
  setup()
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
  expect(fetch).not.toHaveBeenCalled()
})

it('streams field by field, then keeps the finished result with its context', async () => {
  const { result } = setup()
  act(() => result.current.generate({ bookId: '42', force: false }))
  await waitFor(() => expect(requests).toHaveLength(1))

  expect(requests[0].url).toBe('/api/v2/ai/book')
  expect(requests[0].body.threadId).toBe('book-summary:42')
  expect(requests[0].body.forwardedProps).toMatchObject({
    bookId: '42',
    force: false,
  })
  expect(result.current.isLoading).toBe(true)
  expect(result.current.draft).toBeNull()

  await act(async () => {
    started(requests[0])
    startText(requests[0])
    requests[0].send({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'm',
      delta: '{"thesis":"A deliberate life',
    })
  })
  await waitFor(() =>
    expect(result.current.draft?.thesis).toBe('A deliberate life')
  )
  expect(result.current.result).toBeNull()
  expect(result.current.context).toEqual(CONTEXT)

  await act(async () => complete(requests[0]))
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.result).toEqual({ object: SUMMARY, context: CONTEXT })
  expect(result.current.draft).toBeNull()
  expect(result.current.error).toBeUndefined()
})

it('accepts a replayed result, which arrives as one event', async () => {
  const { result } = setup()
  act(() => result.current.generate({ bookId: '42' }))
  await waitFor(() => expect(requests).toHaveLength(1))

  await act(async () => {
    started(requests[0])
    requests[0].send({
      type: 'CUSTOM',
      name: 'structured-output.start',
      value: { messageId: 'cached' },
    })
    requests[0].send({
      type: 'CUSTOM',
      name: 'structured-output.complete',
      value: {
        object: SUMMARY,
        raw: JSON.stringify(SUMMARY),
        messageId: 'cached',
      },
    })
    requests[0].send({
      type: 'RUN_FINISHED',
      threadId: 't',
      runId: 'r',
      finishReason: 'stop',
    })
    requests[0].close()
  })

  await waitFor(() =>
    expect(result.current.result).toEqual({ object: SUMMARY, context: CONTEXT })
  )
})

it('starts from a stored result, and asking again sends a new request', async () => {
  const stored = { object: SUMMARY, context: CONTEXT }
  const { result } = setup(stored)
  expect(result.current.result).toEqual(stored)
  expect(result.current.context).toEqual(CONTEXT)
  expect(fetch).not.toHaveBeenCalled()

  act(() => result.current.generate({ bookId: '42', force: true }))
  await waitFor(() => expect(requests).toHaveLength(1))
  expect(requests[0].body.forwardedProps.force).toBe(true)
  // The old summary stays until the new one has words to show.
  expect(result.current.result).toEqual(stored)
  expect(result.current.draft).toBeNull()
})

it('keeps the error code of a refused request, and the previous result', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json(
        { status: 403, msg: 'Premium is required', code: 'PREMIUM_REQUIRED' },
        { status: 403 }
      )
    )
  )
  const stored = { object: SUMMARY, context: CONTEXT }
  const { result } = setup(stored)
  act(() => result.current.generate({ bookId: '42', force: true }))
  await waitFor(() => expect(result.current.error).toBeDefined())
  expect(result.current.error).toMatchObject({ code: 'PREMIUM_REQUIRED' })
  expect(result.current.isLoading).toBe(false)
  expect(result.current.result).toEqual(stored)
})

it('reports a failure in the stream without inventing a result', async () => {
  const { result } = setup()
  act(() => result.current.generate({ bookId: '42' }))
  await waitFor(() => expect(requests).toHaveLength(1))
  await act(async () => {
    started(requests[0])
    requests[0].send({
      type: 'RUN_ERROR',
      message: 'AI generation failed. Please try again.',
      code: 'AI_GENERATION_FAILED',
    })
    requests[0].close()
  })
  await waitFor(() => expect(result.current.error).toBeDefined())
  expect(result.current.isLoading).toBe(false)
  expect(result.current.result).toBeNull()
})

it('stop cancels the request and falls back to what was there', async () => {
  const { result } = setup()
  act(() => result.current.generate({ bookId: '42' }))
  await waitFor(() => expect(requests).toHaveLength(1))
  act(() => result.current.stop())
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(requests[0].signal.aborted).toBe(true)
  expect(result.current.draft).toBeNull()
  expect(result.current.result).toBeNull()
})

it('asking again while writing replaces the run instead of queueing it', async () => {
  const { result } = setup()
  act(() => result.current.generate({ bookId: '42' }))
  await waitFor(() => expect(requests).toHaveLength(1))
  act(() => result.current.generate({ bookId: '42', force: true }))
  await waitFor(() => expect(requests).toHaveLength(2))
  expect(requests[0].signal.aborted).toBe(true)
  expect(requests[1].body.forwardedProps.force).toBe(true)
})

it('closing the page stops the request', async () => {
  const { result, unmount } = setup()
  act(() => result.current.generate({ bookId: '42' }))
  await waitFor(() => expect(requests).toHaveLength(1))
  unmount()
  await waitFor(() => expect(requests[0].signal.aborted).toBe(true))
})
