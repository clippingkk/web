import type { Attributes } from '@opentelemetry/api'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { registerOTel } from '@vercel/otel'

const SUPERLOG_ENDPOINT = 'https://intake.superlog.sh'
const SUPERLOG_PUBLIC_TOKEN =
  'sl_public_Xoe_xD3tXzPu2loq1Db5HVXX9KsEW_j9W9bwVAwUR4c'

function superlogHeaders(token: string): Record<string, string> {
  return { 'x-api-key': token }
}

function deploymentEnvironment() {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV
  if (process.env.NODE_ENV === 'production') return 'production'
  if (process.env.NODE_ENV === 'test') return 'test'
  return 'development'
}

function repositoryUrl() {
  const owner = process.env.VERCEL_GIT_REPO_OWNER
  const repository = process.env.VERCEL_GIT_REPO_SLUG
  if (owner && repository) return `https://github.com/${owner}/${repository}`
  return 'https://github.com/clippingkk/web'
}

function telemetryAttributes(): Attributes {
  const attributes: Attributes = {
    'service.version': process.env.GIT_COMMIT ?? '5.16.4',
    'deployment.environment.name': deploymentEnvironment(),
    'vcs.repository.url.full': repositoryUrl(),
  }
  const revision =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    process.env.GIT_COMMIT
  if (revision) attributes['vcs.ref.head.revision'] = revision
  return attributes
}

const globalForTelemetry = globalThis as typeof globalThis & {
  clippingkkTelemetryRegistered?: boolean
}

function registerTelemetry() {
  if (globalForTelemetry.clippingkkTelemetryRegistered) return
  const headers = superlogHeaders(SUPERLOG_PUBLIC_TOKEN)
  registerOTel({
    serviceName: 'clippingkk-web',
    attributes: telemetryAttributes(),
    traceExporter: new OTLPTraceExporter({
      url: `${SUPERLOG_ENDPOINT}/v1/traces`,
      headers,
    }),
    logRecordProcessors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: `${SUPERLOG_ENDPOINT}/v1/logs`,
          headers,
        }),
      }),
    ],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${SUPERLOG_ENDPOINT}/v1/metrics`,
          headers,
        }),
        exportIntervalMillis: 10_000,
      }),
    ],
  })
  globalForTelemetry.clippingkkTelemetryRegistered = true
}

export async function register() {
  registerTelemetry()
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { registerNodeRuntime } = await import('./instrumentation.node')
  await registerNodeRuntime()
}
