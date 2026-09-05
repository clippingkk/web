import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'

import { useAIGeneration } from '../use-ai-generation'

vi.mock('@/services/ajax', () => ({
  getLocalToken: () => 'test-token',
  resolveApiBase: () => '',
}))
const encoder = new TextEncoder()
const event = (value: unknown) =>
  encoder.encode(`data: ${JSON.stringify(value)}\n\n`)
let requests: {
  body: Record<string, unknown>
  signal: AbortSignal
  stream: ReadableStreamDefaultController<Uint8Array>
}[]
beforeEach(() => {
  requests = []
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (_url, options) =>
        new Response(
          new ReadableStream({
            start(stream) {
              requests.push({
                body: JSON.parse(options.body),
                signal: options.signal,
                stream,
              })
              stream.enqueue(
                event({ type: 'RUN_STARTED', threadId: 't', runId: 'r' })
              )
              stream.enqueue(
                event({
                  type: 'TEXT_MESSAGE_START',
                  messageId: 'm',
                  role: 'assistant',
                })
              )
            },
          }),
          { headers: { 'Content-Type': 'text/event-stream' } }
        )
    )
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const initial = { enabled: true, input: { language: 'en', clippingId: 1 } }
test('streams incremental content once under StrictMode, then completes', async () => {
  const { result } = renderHook(
    () => useAIGeneration('passage', initial.input, true),
    { wrapper: StrictMode }
  )
  await waitFor(() => expect(requests).toHaveLength(1))
  await act(async () => {
    requests[0].stream.enqueue(
      event({ type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: 'Hello' })
    )
  })
  await waitFor(() => expect(result.current.text).toBe('Hello'))
  await act(async () => {
    requests[0].stream.enqueue(
      event({ type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: ' world' })
    )
    requests[0].stream.enqueue(
      event({ type: 'TEXT_MESSAGE_END', messageId: 'm' })
    )
    requests[0].stream.enqueue(
      event({ type: 'RUN_FINISHED', threadId: 't', runId: 'r' })
    )
    requests[0].stream.close()
  })
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.text).toBe('Hello world')
})
test('closing cancels, reopening restarts, and changed inputs use fresh data', async () => {
  const { result, rerender } = renderHook(
    ({ enabled, input }) => useAIGeneration('passage', input, enabled),
    { initialProps: initial }
  )
  await waitFor(() => expect(requests).toHaveLength(1))
  rerender({ ...initial, enabled: false })
  expect(requests[0].signal.aborted).toBe(true)
  expect(result.current.text).toBe('')
  rerender(initial)
  await waitFor(() => expect(requests).toHaveLength(2))
  rerender({ enabled: true, input: { language: 'en', clippingId: 2 } })
  await waitFor(() => expect(requests).toHaveLength(3))
  expect(requests[1].signal.aborted).toBe(true)
  expect(
    (requests[2].body.forwardedProps as Record<string, unknown>).clippingId
  ).toBe(2)
})
test('subscription errors remain actionable', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json(
        { msg: 'An active Premium subscription is required.' },
        { status: 403 }
      )
    )
  )
  const { result } = renderHook(() =>
    useAIGeneration('passage', initial.input, true)
  )
  await waitFor(() =>
    expect(result.current.error?.message).toContain('Premium subscription')
  )
})
test('partial stream errors end loading and expose an error', async () => {
  const { result } = renderHook(() =>
    useAIGeneration('passage', initial.input, true)
  )
  await waitFor(() => expect(requests).toHaveLength(1))
  await act(async () => {
    requests[0].stream.enqueue(
      event({ type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: 'Partial' })
    )
    requests[0].stream.enqueue(
      event({ type: 'RUN_ERROR', message: 'Please try again.' })
    )
    requests[0].stream.close()
  })
  // The error event can arrive before the request's asynchronous cleanup ends loading.
  await waitFor(() => {
    expect(result.current.error).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })
})
