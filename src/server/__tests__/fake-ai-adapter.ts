import { EventType } from '@tanstack/ai'

type AdapterOptions = {
  threadId: string
  runId?: string
  systemPrompts?: unknown[]
  messages: { role: string; content: unknown }[]
  modelOptions?: Record<string, unknown>
  reasoning?: unknown
  promptCache?: { key?: string }
  request?: { signal?: AbortSignal }
  [key: string]: unknown
}

export type FakeReply = (
  options: AdapterOptions
) => AsyncGenerator<Record<string, unknown>>

/** The model's reply as OpenAI streams it: JSON or text, a few characters at a time. */
export function reply(
  content: unknown,
  usage = { promptTokens: 4, completionTokens: 2, totalTokens: 6 }
): FakeReply {
  const text = typeof content === 'string' ? content : JSON.stringify(content)
  return async function* ({ threadId, runId = 'run' }) {
    const timestamp = Date.now()
    const messageId = 'message'
    yield { type: EventType.RUN_STARTED, threadId, runId, timestamp }
    yield {
      type: EventType.TEXT_MESSAGE_START,
      messageId,
      role: 'assistant',
      timestamp,
    }
    for (const delta of text.match(/.{1,16}/gs) ?? []) {
      yield {
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId,
        delta,
        timestamp,
      }
    }
    yield { type: EventType.TEXT_MESSAGE_END, messageId, timestamp }
    yield {
      type: EventType.RUN_FINISHED,
      threadId,
      runId,
      finishReason: 'stop',
      usage,
      timestamp,
    }
  }
}

/** The provider failing the way the real adapter reports it. */
export function providerError(
  message: string,
  code = 'invalid_api_key'
): FakeReply {
  return async function* ({ threadId, runId = 'run' }) {
    yield {
      type: EventType.RUN_STARTED,
      threadId,
      runId,
      timestamp: Date.now(),
    }
    yield {
      type: EventType.RUN_ERROR,
      message,
      code,
      error: { message, code },
      timestamp: Date.now(),
    }
  }
}

/**
 * A text adapter behind the real `chat()`, so tests run the SDK's stream,
 * validation, and middleware instead of a stand-in. Like OpenAI's it asks for
 * the schema on the main request, so one generation is one model call.
 */
export function fakeAdapter(next: () => FakeReply, model = 'test-model') {
  const calls: AdapterOptions[] = []
  const adapter = {
    kind: 'text',
    name: 'fake',
    model,
    '~types': {},
    supportsFileSources: false,
    supportsCombinedToolsAndSchema: () => true,
    chatStream(options: AdapterOptions) {
      calls.push(options)
      return next()(options)
    },
    async structuredOutput() {
      throw new Error('The combined request should answer structured output')
    },
  }
  return { adapter, calls }
}

export function promptData<T>(call: AdapterOptions) {
  const content = call.messages.at(-1)?.content
  return JSON.parse(
    typeof content === 'string'
      ? content
      : (content as { text: string }[]).map(({ text }) => text).join('')
  ) as T
}

export function promptSystem(call: AdapterOptions) {
  return JSON.stringify(call.systemPrompts)
}

/** The AG-UI envelope `useChat` posts, with `forwardedProps` as the feature's input. */
export function aiRequest(path: string, forwardedProps: unknown) {
  return new Request(`http://localhost/api/v2/ai/${path}`, {
    method: 'POST',
    body: JSON.stringify({
      threadId: 'thread',
      runId: 'run',
      messages: [],
      tools: [],
      context: [],
      forwardedProps,
    }),
  })
}

/** Each SSE event of a response body, parsed. */
export async function sseEvents(response: Response) {
  const body = await response.text()
  return body
    .split('\n\n')
    .filter((block) => block.startsWith('data: '))
    .map(
      (block) =>
        JSON.parse(block.slice('data: '.length)) as Record<string, unknown> & {
          type: string
          name?: string
          value?: unknown
          message?: string
        }
    )
}
