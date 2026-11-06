import {
  context,
  metrics,
  SpanStatusCode,
  trace,
  type Context,
  type Span,
} from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import type { ChatMiddleware } from '@tanstack/ai'

const tracer = trace.getTracer('clippingkk.web.ai')
const meter = metrics.getMeter('clippingkk.web.ai')
const logger = logs.getLogger('clippingkk.web.ai')

const generations = meter.createCounter('app.ai.generations')
const generationDuration = meter.createHistogram('app.ai.duration', {
  unit: 'ms',
})
const inputTokens = meter.createCounter('llm.tokens.input', { unit: 'tokens' })
const outputTokens = meter.createCounter('llm.tokens.output', {
  unit: 'tokens',
})
const results = meter.createCounter('app.ai.results')
const resultDuration = meter.createHistogram('app.ai.result.duration', {
  unit: 'ms',
})

/**
 * One model call: a span, token counts, and its outcome. The SDK runs exactly
 * one of onFinish, onAbort, and onError, so every span ends exactly once.
 * Neither the prompt nor the reply is recorded, because both are a reader's text.
 */
export function generationTelemetry(
  useCase: string,
  model: string,
  parent?: Context
): ChatMiddleware {
  const attributes = {
    'gen_ai.provider.name': 'openai',
    'gen_ai.request.model': model,
    'app.gen_ai.use_case': useCase,
  }
  let span: Span | undefined
  let started = 0

  function finish(outcome: 'success' | 'cancelled' | 'error') {
    if (!span) return
    span.setAttribute('outcome', outcome)
    if (outcome === 'error') span.setStatus({ code: SpanStatusCode.ERROR })
    logger.emit({
      context: trace.setSpan(context.active(), span),
      severityNumber:
        outcome === 'error' ? SeverityNumber.WARN : SeverityNumber.INFO,
      severityText: outcome === 'error' ? 'WARN' : 'INFO',
      body: 'AI generation completed',
      attributes: { ...attributes, outcome },
    })
    generations.add(1, { ...attributes, outcome })
    generationDuration.record(performance.now() - started, {
      ...attributes,
      outcome,
    })
    span.end()
    span = undefined
  }

  return {
    name: 'clippingkk-telemetry',
    onStart() {
      started = performance.now()
      span = tracer.startSpan('ai.generate', { attributes }, parent)
    },
    onUsage(_ctx, usage) {
      inputTokens.add(usage.promptTokens, attributes)
      outputTokens.add(usage.completionTokens, attributes)
    },
    onFinish: () => finish('success'),
    onAbort: () => finish('cancelled'),
    onError: () => finish('error'),
  }
}

/** The provider's error code tells an expired key from a bad reply. Its message may quote anything. */
export function logGenerationFailure(useCase: string, code?: string) {
  logger.emit({
    severityNumber: SeverityNumber.WARN,
    severityText: 'WARN',
    body: 'AI provider returned an error',
    attributes: {
      'app.gen_ai.use_case': useCase,
      'error.type': code ?? 'unknown',
    },
  })
}

export function logResultWarning(body: string, useCase: string) {
  logger.emit({
    severityNumber: SeverityNumber.WARN,
    severityText: 'WARN',
    body,
    attributes: { 'app.gen_ai.use_case': useCase, outcome: 'error' },
  })
}

export type ResultOutcome = 'cache_hit' | 'generated' | 'cancelled' | 'error'
export type ResultCache = 'hit' | 'miss' | 'bypass'

/**
 * One request for a result, whether it was replayed or written. Declare it
 * with `using` in the generator serving the result: it then closes when the
 * stream ends, fails, or the reader leaves mid-stream, and that last case
 * keeps the default outcome of `cancelled`.
 */
export function resultTelemetry(
  useCase: string,
  attributes: Record<string, string | number> = {}
) {
  const span = tracer.startSpan('ai.result', {
    attributes: { 'app.gen_ai.use_case': useCase, ...attributes },
  })
  const started = performance.now()
  const state = {
    outcome: 'cancelled' as ResultOutcome,
    cache: 'miss' as ResultCache,
    parent: trace.setSpan(context.active(), span),
    [Symbol.dispose]() {
      const { outcome, cache } = state
      const labels = { 'app.gen_ai.use_case': useCase, outcome, cache }
      span.setAttribute('outcome', outcome)
      span.setAttribute('cache', cache)
      if (outcome === 'error') span.setStatus({ code: SpanStatusCode.ERROR })
      results.add(1, labels)
      resultDuration.record(performance.now() - started, labels)
      logger.emit({
        context: state.parent,
        severityNumber:
          outcome === 'error' ? SeverityNumber.WARN : SeverityNumber.INFO,
        severityText: outcome === 'error' ? 'WARN' : 'INFO',
        body: 'AI result finished',
        attributes: labels,
      })
      span.end()
    },
  }
  return state
}
