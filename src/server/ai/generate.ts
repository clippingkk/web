import { randomUUID } from 'node:crypto'

import type { Context } from '@opentelemetry/api'
import { chat, EventType, type StreamChunk } from '@tanstack/ai'
import { createOpenaiChat, OPENAI_CHAT_MODELS } from '@tanstack/ai-openai'
import type { z } from 'zod'

import { getServerEnv } from '../env'
import { ApiError } from '../errors'
import type { BuiltPrompt } from './prompts'
import { generationTelemetry, logGenerationFailure } from './telemetry'

const GENERATION_TIMEOUT_MS = 120_000
/** Covers reasoning and the reply. A truncated reply is invalid JSON and fails the run. */
const MAX_OUTPUT_TOKENS = 8_000
const GENERATION_FAILED = 'AI generation failed. Please try again.'

export type AIUseCase =
  | 'book_summary'
  | 'passage_note'
  | 'recommendations'
  | 'reading_portrait'
  | 'comment_rewrite'

export type GenerationRequest = {
  useCase: AIUseCase
  prompt: BuiltPrompt
  signal?: AbortSignal
  /** The browser's run ids, echoed back on the stream. */
  run?: { threadId: string; runId: string }
  /** The span this model call belongs to. */
  parent?: Context
}

/** `chat()` takes a controller, so this bridges a composed signal into one. */
export function controllerFor(signal?: AbortSignal) {
  const controller = new AbortController()
  if (signal?.aborted) controller.abort(signal.reason)
  signal?.addEventListener('abort', () => controller.abort(signal.reason), {
    once: true,
    signal: controller.signal,
  })
  return controller
}

/** Throws when generation cannot start, so a route can answer before opening a stream. */
export function textModel() {
  const { OPENAI_API_KEY: apiKey, OPENAI_MODEL: configured } = getServerEnv()
  if (!apiKey || !configured)
    throw new ApiError(
      'AI is not configured. Please try again later.',
      503,
      'AI_UNAVAILABLE'
    )
  const model = OPENAI_CHAT_MODELS.find((item) => item === configured)
  if (!model)
    throw new ApiError(
      'The configured AI model is unsupported.',
      503,
      'AI_UNAVAILABLE'
    )
  return {
    model,
    adapter: createOpenaiChat(model, apiKey, {
      timeout: GENERATION_TIMEOUT_MS,
      maxRetries: 1,
    }),
  }
}

/** Older chat models reject the reasoning parameter outright. */
function supportsReasoning(model: string) {
  return /^(o\d|gpt-[5-9])/.test(model) && !model.endsWith('-chat-latest')
}

function runOptions({
  useCase,
  prompt,
  signal,
  run,
  parent,
}: GenerationRequest) {
  const { adapter, model } = textModel()
  const signals = [AbortSignal.timeout(GENERATION_TIMEOUT_MS)]
  if (signal) signals.push(signal)
  return {
    adapter,
    systemPrompts: prompt.system,
    messages: [{ role: 'user' as const, content: JSON.stringify(prompt.data) }],
    threadId: run?.threadId ?? `${useCase}:${randomUUID()}`,
    runId: run?.runId,
    abortController: controllerFor(AbortSignal.any(signals)),
    // Every reader of a feature shares its instructions, so they share a cache key.
    promptCache: { key: `clippingkk-${useCase}` },
    // No summary: nothing shows it, and OpenAI gates it on organisation verification.
    reasoning: supportsReasoning(model)
      ? { level: 'low' as const, summary: false }
      : undefined,
    // Readers' highlights have no reason to stay on OpenAI's servers.
    modelOptions: { store: false, max_output_tokens: MAX_OUTPUT_TOKENS },
    middleware: [generationTelemetry(useCase, model, parent)],
  }
}

/**
 * What a reader is told about anything that went wrong. Provider errors can
 * quote a key prefix, a request id, or the model's raw reply, and database
 * errors can name a host, so the browser only ever gets our own message.
 */
export function generationFailure(useCase: AIUseCase, error: unknown) {
  if (error instanceof ApiError) return error
  logGenerationFailure(useCase)
  return new ApiError(GENERATION_FAILED, 502, 'AI_GENERATION_FAILED')
}

async function* withSafeErrors(
  useCase: AIUseCase,
  stream: AsyncIterable<StreamChunk>
): AsyncGenerator<StreamChunk> {
  try {
    for await (const chunk of stream) {
      if (chunk.type !== EventType.RUN_ERROR) {
        yield chunk
        continue
      }
      logGenerationFailure(useCase, chunk.code ?? chunk.error?.code)
      yield {
        type: EventType.RUN_ERROR,
        message: GENERATION_FAILED,
        code: 'AI_GENERATION_FAILED',
        timestamp: chunk.timestamp,
      }
    }
  } catch (error) {
    throw generationFailure(useCase, error)
  }
}

/** Streams an object field by field. `useChat` renders it as `partial`, then `final`. */
export function streamAIObject<TSchema extends z.ZodType>(
  request: GenerationRequest,
  schema: TSchema
): AsyncGenerator<StreamChunk> {
  return withSafeErrors(
    request.useCase,
    chat({ ...runOptions(request), outputSchema: schema, stream: true })
  )
}

export async function generateAIObject<TSchema extends z.ZodType>(
  request: GenerationRequest,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  try {
    return (await chat({
      ...runOptions(request),
      outputSchema: schema,
    })) as z.infer<TSchema>
  } catch (error) {
    throw generationFailure(request.useCase, error)
  }
}

export async function generateAIText(
  request: GenerationRequest
): Promise<string> {
  try {
    const { text } = await chat({ ...runOptions(request), stream: false })
    return text
  } catch (error) {
    throw generationFailure(request.useCase, error)
  }
}
