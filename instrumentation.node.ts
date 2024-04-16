import '@newrelic/next'
import uptrace from '@uptrace/node'
import otel from '@opentelemetry/api'

const startNodeMetrics = require('opentelemetry-node-metrics')

uptrace.configureOpentelemetry({
  dsn: 'https://NKfwDjkcdktZ232pVGf4DA@api.uptrace.dev?grpc=4317',
  serviceName: 'ck-web',
  serviceVersion: process.env.GIT_COMMIT,
  deploymentEnvironment: process.env.NODE_ENV || 'development',
  resourceAttributes: {
    'nodejs.version': process.versions.node,
    'nodejs.platform': process.platform,
    'nodejs.arch': process.arch
  },
})

const meterProvider = otel.metrics.getMeterProvider()
startNodeMetrics(meterProvider)
