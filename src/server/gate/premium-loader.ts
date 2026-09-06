import { metrics, trace, SpanStatusCode } from '@opentelemetry/api'
import DataLoader from 'dataloader'

import { gateRequest, projectPath } from './client'
import { gateConfig } from './config'

const failures = metrics
  .getMeter('clippingkk.billing')
  .createCounter('billing.premium.display_failures')
const tracer = trace.getTracer('clippingkk.billing')
const loaders = new WeakMap<Request, DataLoader<string, string>>()

/** Display-only data: outages hide badges, never grant access or break public queries. */
export function userPremiumEndAt(request: Request, subject: string | null) {
  if (!subject) return Promise.resolve('')
  let loader = loaders.get(request)
  if (!loader) {
    loader = new DataLoader<string, string>(
      async (subjects) =>
        tracer.startActiveSpan('billing.premium.batch', async (span) => {
          span.setAttribute('batch.size', subjects.length)
          try {
            const rows = await gateRequest<
              { subjectId: string; premiumEndAt: string | null }[]
            >(`${projectPath()}/billing/subjects/state`, {
              method: 'POST',
              body: JSON.stringify({
                environmentId: gateConfig().environmentId,
                subjectIds: subjects,
              }),
            })
            const states = new Map(
              rows.map((row) => [row.subjectId, row.premiumEndAt ?? ''])
            )
            return subjects.map((subjectId) => states.get(subjectId) ?? '')
          } catch {
            span.setStatus({ code: SpanStatusCode.ERROR })
            failures.add(1)
            return subjects.map(() => '')
          } finally {
            span.end()
          }
        }),
      { maxBatchSize: 100 }
    )
    loaders.set(request, loader)
  }
  return loader.load(subject)
}
