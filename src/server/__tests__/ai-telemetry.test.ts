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

import { fakeAdapter, providerError, reply } from './fake-ai-adapter'

const state = vi.hoisted(() => ({
  phase: 0,
  cache: new Map<string, unknown>(),
  createAdapter: vi.fn(),
}))
vi.mock('../env', () => ({
  getServerEnv: () => ({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test-model' }),
}))
vi.mock('@tanstack/ai-openai', () => ({
  OPENAI_CHAT_MODELS: ['test-model'],
  createOpenaiChat: state.createAdapter,
}))
vi.mock('@/services/wenqu', async (original) => ({
  ...(await original<typeof import('@/services/wenqu')>()),
  wenquRequest: async () => ({ books: [] }),
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
                  title: 'Walden',
                  content: 'private highlight text that must not leak',
                },
                {
                  id: 2,
                  title: 'Walden',
                  content: 'second private highlight about the same book',
                },
              ]
              return state.phase % 2 === 1
                ? rows.map(({ id }) => ({ id }))
                : rows
            },
          }),
        }),
      }),
    },
  }),
}))
vi.mock('../redis', () => ({
  cacheGet: async (key: string) => state.cache.get(key),
  cacheSet: async (key: string, value: unknown) => {
    state.cache.set(key, value)
  },
}))

const SUMMARY = {
  thesis: 'private model reply that must not leak',
  themes: [{ title: 'A theme', insight: 'An insight.', highlightRef: 1 }],
  question: 'A question?',
}

test('generation exports real OTLP spans, metrics, and correlated logs without reader text', async () => {
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
    const { streamBookSummary } = await import('../ai/book-summary')
    const { generateAIText } = await import('../ai/generate')
    const { readingPortraitPrompt } = await import('../ai/prompts')
    let script = reply('hello')
    state.createAdapter.mockImplementation(
      () => fakeAdapter(() => script).adapter
    )
    await expect(
      generateAIText({
        useCase: 'reading_portrait',
        prompt: readingPortraitPrompt('English', [
          'private smoke-test passage',
        ]),
      })
    ).resolves.toBe('hello')

    script = reply(SUMMARY)
    const summarize = async () => {
      const types: string[] = []
      for await (const chunk of await streamBookSummary(
        7,
        { bookId: '24601', force: false },
        { threadId: 't', runId: 'r' },
        new AbortController().signal
      ))
        types.push(chunk.type === 'CUSTOM' ? chunk.name : chunk.type)
      return types
    }
    await expect(summarize()).resolves.toContain('structured-output.complete')
    // The second request replays from the cache.
    await expect(summarize()).resolves.toContain('structured-output.complete')

    state.cache.clear()
    script = providerError('private provider error text')
    await expect(summarize()).resolves.toContain('RUN_ERROR')

    await Promise.all([
      tracing.forceFlush(),
      metering.forceFlush(),
      logging.forceFlush(),
    ])
    const traces = (received['/v1/traces'] ?? []).join('\n')
    const metricsBody = (received['/v1/metrics'] ?? []).join('\n')
    const logBody = (received['/v1/logs'] ?? []).join('\n')
    expect(traces).toContain('ai.generate')
    expect(traces).toContain('ai.result')
    expect(metricsBody).toContain('llm.tokens.input')
    expect(metricsBody).toContain('llm.tokens.output')
    expect(metricsBody).toContain('app.ai.generations')
    expect(metricsBody).toContain('app.ai.duration')
    expect(metricsBody).toContain('app.ai.results')
    expect(metricsBody).toContain('app.ai.result.duration')
    expect(metricsBody).toContain('cache_hit')
    expect(metricsBody).toContain('generated')
    expect(logBody).toContain('AI generation completed')
    expect(logBody).toContain('AI result finished')
    // An expired key must be findable in the logs, without the provider's text.
    expect(logBody).toContain('AI provider returned an error')
    expect(logBody).toContain('invalid_api_key')

    const spans = (received['/v1/traces'] ?? []).flatMap(
      (body) =>
        JSON.parse(body).resourceSpans[0].scopeSpans[0].spans as {
          name?: string
          traceId?: string
          spanId?: string
          parentSpanId?: string
        }[]
    )
    const records = (received['/v1/logs'] ?? []).flatMap(
      (body) =>
        JSON.parse(body).resourceLogs[0].scopeLogs[0].logRecords as {
          traceId?: string
          spanId?: string
        }[]
    )
    const resultSpan = spans.find((span) => span.name === 'ai.result')
    const resultLog = records.find(
      (record) => record.spanId === resultSpan?.spanId
    )
    expect(resultLog?.traceId).toBe(resultSpan?.traceId)
    const children = spans.filter(
      (span) =>
        span.name === 'ai.generate' && span.traceId === resultSpan?.traceId
    )
    expect(children.length).toBeGreaterThan(0)
    expect(children[0].parentSpanId).toBe(resultSpan?.spanId)

    const exported = JSON.stringify(received)
    expect(exported).not.toContain('private smoke-test passage')
    expect(exported).not.toContain('private highlight text that must not leak')
    expect(exported).not.toContain('private model reply that must not leak')
    expect(exported).not.toContain('private provider error text')
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
