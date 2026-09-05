import { context, metrics, SpanStatusCode, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { chat, type StreamChunk } from '@tanstack/ai'
import { createOpenaiChat, OPENAI_CHAT_MODELS } from '@tanstack/ai-openai'

import { getServerEnv } from '../env'
import { ApiError } from '../errors'
import { buildPrompt, type AIPrompt } from './prompts'

const tracer = trace.getTracer('clippingkk.web.ai')
const meter = metrics.getMeter('clippingkk.web.ai')
const logger = logs.getLogger('clippingkk.web.ai')
const generations = meter.createCounter('app.ai.generations')
const duration = meter.createHistogram('app.ai.duration', { unit: 'ms' })
const inputTokens = meter.createCounter('llm.tokens.input', { unit: 'tokens' })
const outputTokens = meter.createCounter('llm.tokens.output', {
  unit: 'tokens',
})

export function generateAI(input: AIPrompt, signal?: AbortSignal) {
  const { OPENAI_API_KEY: apiKey, OPENAI_MODEL: model } = getServerEnv()
  if (!apiKey || !model)
    throw new ApiError(
      'AI is not configured. Please try again later.',
      503,
      'AI_UNAVAILABLE'
    )
  const selectedModel = OPENAI_CHAT_MODELS.find((item) => item === model)
  if (!selectedModel)
    throw new ApiError(
      'The configured AI model is unsupported.',
      503,
      'AI_UNAVAILABLE'
    )
  const adapter = createOpenaiChat(selectedModel, apiKey, {
    timeout: 120_000,
    maxRetries: 0,
  })
  const prompt = buildPrompt(input)

  return (async function* (): AsyncGenerator<StreamChunk> {
    // The generation span must remain open until the stream finishes or is cancelled.
    const span = tracer.startSpan('ai.generate', {
      attributes: {
        'gen_ai.provider.name': 'openai',
        'gen_ai.request.model': model,
        'app.gen_ai.use_case': input.kind,
      },
    })
    const started = performance.now()
    const controller = new AbortController()
    const cancel = () => controller.abort(signal?.reason)
    signal?.addEventListener('abort', cancel, { once: true })
    if (signal?.aborted) cancel()
    const timer = setTimeout(
      () => controller.abort(new Error('AI generation timed out')),
      120_000
    )
    let outcome = 'cancelled'
    const attributes = {
      'gen_ai.provider.name': 'openai',
      'gen_ai.request.model': model,
      'app.gen_ai.use_case': input.kind,
      'app.gen_ai.call_site': 'generateAI',
    }
    try {
      controller.signal.throwIfAborted()
      for await (const chunk of chat({
        adapter,
        systemPrompts: [prompt.system],
        messages: [{ role: 'user', content: JSON.stringify(prompt.data) }],
        abortController: controller,
      })) {
        controller.signal.throwIfAborted()
        if (chunk.type === 'RUN_ERROR') throw new Error('AI generation failed')
        if (chunk.type === 'RUN_FINISHED' && chunk.usage) {
          const usage = Array.isArray(chunk.usage)
            ? chunk.usage
            : [
                {
                  inputTokens: chunk.usage.promptTokens,
                  outputTokens: chunk.usage.completionTokens,
                },
              ]
          for (const item of usage) {
            if (item.inputTokens !== undefined)
              inputTokens.add(item.inputTokens, attributes)
            if (item.outputTokens !== undefined)
              outputTokens.add(item.outputTokens, attributes)
          }
        }
        yield chunk
      }
      controller.signal.throwIfAborted()
      outcome = 'success'
    } catch {
      outcome = signal?.aborted ? 'cancelled' : 'error'
      if (outcome === 'error') {
        span.setStatus({ code: SpanStatusCode.ERROR })
        span.recordException(new Error('AI generation failed'))
        logger.emit({
          context: trace.setSpan(context.active(), span),
          severityNumber: SeverityNumber.WARN,
          body: 'AI generation failed',
          attributes,
        })
      }
      throw new ApiError(
        'AI generation failed. Please try again.',
        502,
        'AI_GENERATION_FAILED'
      )
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancel)
      controller.abort()
      span.setAttribute('outcome', outcome)
      logger.emit({
        context: trace.setSpan(context.active(), span),
        severityNumber: SeverityNumber.INFO,
        body: 'AI generation completed',
        attributes: { ...attributes, outcome },
      })
      generations.add(1, { ...attributes, outcome })
      duration.record(performance.now() - started, { ...attributes, outcome })
      span.end()
    }
  })()
}

export async function generateAIText(input: AIPrompt, signal?: AbortSignal) {
  let text = ''
  for await (const chunk of generateAI(input, signal)) {
    if (chunk.type === 'TEXT_MESSAGE_CONTENT') text += chunk.delta
  }
  return text
}
