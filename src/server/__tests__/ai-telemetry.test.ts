// @vitest-environment node
import { createServer } from 'node:http'

import { metrics, trace } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'

const state = vi.hoisted(() => ({
  phase: 0,
  cache: new Map<string, { fingerprint: string; text: string }>(),
}))
vi.mock('../env', () => ({
  getServerEnv: () => ({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test-model' }),
}))
vi.mock('@tanstack/ai-openai', () => ({
  OPENAI_CHAT_MODELS: ['test-model'],
  createOpenaiChat: vi.fn(),
}))
vi.mock('@tanstack/ai', async (original) => ({
  ...(await original<typeof import('@tanstack/ai')>()),
  chat: async function* () {
    yield { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm', delta: 'hello' }
    yield {
      type: 'RUN_FINISHED',
      threadId: 't',
      runId: 'r',
      usage: [{ inputTokens: 4, outputTokens: 2 }],
    }
  },
}))
vi.mock('../db', () => ({
  getDatabase: () => ({
    db: {
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => {
              state.phase += 1
              const rows = [
                {
                  id: 1,
                  content: 'private highlight text that must not leak',
                },
                {
                  id: 2,
                  content: 'second private highlight about the same book',
                },
              ]
              return state.phase % 2 === 1
                ? rows.map(({ id }) => ({ id }))
                : rows.map(({ content }) => ({ content }))
            },
          }),
        }),
      }),
    },
  }),
}))
vi.mock('../redis', () => ({
  cacheGet: async (key: string) => state.cache.get(key),
  cacheSet: async (
    key: string,
    value: { fingerprint: string; text: string }
  ) => {
    state.cache.set(key, value)
  },
}))

test('generation exports real OTLP spans, metrics, and correlated logs without prompt content', async () => {
  const received: Record<string, string[]> = {}
  const server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    const url = request.url ?? ''
    received[url] ??= []
    received[url].push(Buffer.concat(chunks).toString())
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end('{}')
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('No collector address')
  const base = `http://127.0.0.1:${address.port}`
  const tracing = new BasicTracerProvider({
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPTraceExporter({ url: `${base}/v1/traces` })
      ),
    ],
  })
  const metering = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: `${base}/v1/metrics` }),
        exportIntervalMillis: 60_000,
      }),
    ],
  })
  const logging = new LoggerProvider({
    processors: [
      new SimpleLogRecordProcessor({
        exporter: new OTLPLogExporter({ url: `${base}/v1/logs` }),
      }),
    ],
  })
  trace.setGlobalTracerProvider(tracing)
  metrics.setGlobalMeterProvider(metering)
  logs.setGlobalLoggerProvider(logging)
  try {
    const { generateAIText } = await import('../ai/generate')
    await expect(
      generateAIText({
        kind: 'passage',
        language: 'en',
        book: {},
        passage: 'private smoke-test passage',
      })
    ).resolves.toBe('hello')
    const { streamBookSummary } = await import('../ai/book-summary')
    const book = {
      bookId: '24601',
      title: 'Walden',
      author: 'Thoreau',
      force: false,
    }
    const read = async () => {
      let text = ''
      for await (const chunk of await streamBookSummary(7, book)) {
        if (chunk.type === 'TEXT_MESSAGE_CONTENT') text += chunk.delta
      }
      return text
    }
    await expect(read()).resolves.toBe('hello')
    await expect(read()).resolves.toBe('hello')
    await Promise.all([
      tracing.forceFlush(),
      metering.forceFlush(),
      logging.forceFlush(),
    ])
    const traces = (received['/v1/traces'] ?? []).join('\n')
    const metricsBody = (received['/v1/metrics'] ?? []).join('\n')
    const logBody = (received['/v1/logs'] ?? []).join('\n')
    expect(traces).toContain('ai.generate')
    expect(traces).toContain('ai.book_summary')
    expect(metricsBody).toContain('llm.tokens.input')
    expect(metricsBody).toContain('app.ai.duration')
    expect(metricsBody).toContain('app.ai.book_summaries')
    expect(metricsBody).toContain('app.ai.book_summary.duration')
    expect(metricsBody).toContain('cache_hit')
    expect(logBody).toContain('AI generation completed')
    expect(logBody).toContain('book summary finished')
    const spans = (received['/v1/traces'] ?? []).flatMap(
      (body) =>
        JSON.parse(body).resourceSpans[0].scopeSpans[0].spans as {
          name?: string
          traceId?: string
          spanId?: string
        }[]
    )
    const records = (received['/v1/logs'] ?? []).flatMap(
      (body) =>
        JSON.parse(body).resourceLogs[0].scopeLogs[0].logRecords as {
          traceId?: string
          spanId?: string
        }[]
    )
    const generateSpan = spans.find((span) => span.name === 'ai.generate')
    const generateLog = records.find(
      (record) => record.spanId === generateSpan?.spanId
    )
    expect(generateLog?.traceId).toBe(generateSpan?.traceId)
    const bookSpan = spans.find((span) => span.name === 'ai.book_summary')
    const bookLog = records.find((record) => record.spanId === bookSpan?.spanId)
    expect(bookLog?.traceId).toBe(bookSpan?.traceId)
    const exported = JSON.stringify(received)
    expect(exported).not.toContain('private smoke-test passage')
    expect(exported).not.toContain('private highlight text that must not leak')
  } finally {
    await Promise.all([
      tracing.shutdown(),
      metering.shutdown(),
      logging.shutdown(),
    ])
    trace.disable()
    metrics.disable()
    logs.disable()
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    )
  }
})
