export async function register() {
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return
  }
  if (process.env.DEBUG === '1') {
    heapSnapshot()
  }
  if (process.env.OTEL_ENABLED === '1') {
    await otel()
  }
}

async function otel(){
  const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base')
  const { resourceFromAttributes } = await import('@opentelemetry/resources')
  const { NodeSDK } = await import('@opentelemetry/sdk-node')
  const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
  const { AWSXRayIdGenerator } = await import('@opentelemetry/id-generator-aws-xray')

  const dsn = 'https://NKfwDjkcdktZ232pVGf4DA@api.uptrace.dev?grpc=4317'

  const exporter = new OTLPTraceExporter({
    url: 'https://api.uptrace.dev/v1/traces',
    headers: { 'uptrace-dsn': dsn },
    compression: 'gzip',
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
  console.log('Instrumentation step otel done')
}

async function heapSnapshot() {
  const { Session } = await import('node:inspector/promises')
  const fs = await import('node:fs')

  async function dumpHeapSnapshot() {
    const session = new Session()

    const now = new Date()
    // YYYY-MM-DD_HH-MM-SS
    const filename = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.heapsnapshot`

    const fd = fs.openSync(filename, 'w')

    session.connect()

    session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
      fs.writeSync(fd, m.params.chunk)
    })

    const result = await session.post('HeapProfiler.takeHeapSnapshot')
    console.log('HeapProfiler.takeHeapSnapshot done:', result)
    session.disconnect()
    fs.closeSync(fd)
  }

  console.log('Starting heap snapshot dump...')

  const THREE_HOURS = 3 * 60 * 60 * 1000
  await dumpHeapSnapshot()
  setInterval(async () => {
    await dumpHeapSnapshot()
  }, THREE_HOURS)
  console.log('Instrumentation step heap snapshot done')
}
  
