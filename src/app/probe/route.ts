import { metrics, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { withSpan } from '@superlog/otel-helpers'
import { connection } from 'next/server'

import { isDatabaseReady } from '@/server/db'
import { isRedisReady } from '@/server/redis'

const tracer = trace.getTracer('clippingkk.web.probe')
const meter = metrics.getMeter('clippingkk.web.probe')
const logger = logs.getLogger('clippingkk.web.probe')
const readinessChecks = meter.createCounter('app.readiness.checks', {
  description: 'Completed application readiness checks',
})
const readinessDuration = meter.createHistogram('app.readiness.duration', {
  description: 'Application readiness check duration',
  unit: 'ms',
})

export async function GET() {
  await connection()
  return withSpan(
    'readiness.check',
    async (span) => {
      const startedAt = performance.now()
      const [database, redis] = await Promise.all([
        isDatabaseReady(),
        isRedisReady(),
      ])
      const outcome = database && redis ? 'success' : 'error'
      const attributes = {
        'dependency.database.ready': database,
        'dependency.redis.ready': redis,
        outcome,
      }
      span.setAttributes(attributes)
      readinessChecks.add(1, { outcome })
      readinessDuration.record(performance.now() - startedAt, { outcome })
      logger.emit({
        severityNumber:
          outcome === 'success' ? SeverityNumber.INFO : SeverityNumber.WARN,
        severityText: outcome === 'success' ? 'INFO' : 'WARN',
        body: 'Readiness check completed',
        attributes,
      })
      if (!database || !redis)
        return Response.json({ database, redis }, { status: 503 })
      return new Response(null, { status: 204 })
    },
    { tracer }
  )
}
