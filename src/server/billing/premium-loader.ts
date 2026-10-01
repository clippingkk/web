import { metrics, trace, SpanStatusCode } from '@opentelemetry/api'
import DataLoader from 'dataloader'

import { premiumStates } from './gate'

const failures = metrics
  .getMeter('clippingkk.billing')
  .createCounter('billing.premium.display_failures')
const tracer = trace.getTracer('clippingkk.billing')
const loaders = new WeakMap<Request, DataLoader<string, string>>()

/**
 * Display-only data: outages hide badges, never grant access or break public
 * queries. Access checks use `isPremium`, which fails loudly instead.
 */
export function userPremiumEndAt(request: Request, subject: string | null) {
  if (!subject) return Promise.resolve('')
  let loader = loaders.get(request)
  if (!loader) {
    loader = new DataLoader<string, string>(
      async (subjects) =>
        tracer.startActiveSpan('billing.premium.batch', async (span) => {
          span.setAttribute('batch.size', subjects.length)
          try {
            return (await premiumStates(subjects)).map((end) => end ?? '')
          } catch (error) {
            // Every reader shows as Free while this fails, so it must be seen.
            console.error('billing: Premium display state unavailable', error)
            span.recordException(
              error instanceof Error ? error : new Error(String(error))
            )
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
