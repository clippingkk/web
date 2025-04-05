import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray'

const dsn = 'https://NKfwDjkcdktZ232pVGf4DA@api.uptrace.dev?grpc=4317'

const exporter = new OTLPTraceExporter({
  url: 'https://api.uptrace.dev/v1/traces',
  headers: { 'uptrace-dsn': dsn },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compression: 'gzip' as any,
})
const bsp = new BatchSpanProcessor(exporter, {
  maxExportBatchSize: 1000,
  maxQueueSize: 1000,
})

const sdk = new NodeSDK({
  spanProcessor: bsp,
  resource: resourceFromAttributes({
    'nodejs.version': process.versions.node,
    'nodejs.platform': process.platform,
    'nodejs.arch': process.arch,
    'service.name': 'ck-web',
    'service.version': process.env.GIT_COMMIT,
    '_kind': 'server',
  }),
  idGenerator: new AWSXRayIdGenerator(),
})
sdk.start()