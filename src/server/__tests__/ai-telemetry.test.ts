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

vi.mock('../env', () => ({
  getServerEnv: () => ({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test-model' }),
}))
vi.mock('@tanstack/ai-openai', () => ({
  OPENAI_CHAT_MODELS: ['test-model'],
  createOpenaiChat: vi.fn(),
}))
vi.mock('@tanstack/ai', () => ({
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

test('generation exports real OTLP spans, metrics, and correlated logs without prompt content', async () => {
  const received: Record<string, string> = {}
  const server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    received[request.url!] = Buffer.concat(chunks).toString()
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
    await Promise.all([
      tracing.forceFlush(),
      metering.forceFlush(),
      logging.forceFlush(),
    ])
    expect(received['/v1/traces']).toContain('ai.generate')
    expect(received['/v1/metrics']).toContain('llm.tokens.input')
    expect(received['/v1/metrics']).toContain('app.ai.duration')
    expect(received['/v1/logs']).toContain('AI generation completed')
    const spans = JSON.parse(received['/v1/traces']).resourceSpans[0]
      .scopeSpans[0].spans
    const records = JSON.parse(received['/v1/logs']).resourceLogs[0]
      .scopeLogs[0].logRecords
    expect(records[0].traceId).toBe(spans[0].traceId)
    expect(records[0].spanId).toBe(spans[0].spanId)
    expect(JSON.stringify(received)).not.toContain('private smoke-test passage')
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
