import { hash, randomUUID } from 'node:crypto'

import { EventType, type StreamChunk } from '@tanstack/ai'
import type { z } from 'zod'

import { AI_CONTEXT_EVENT } from '@/lib/ai/schemas'

import { cacheGet, cacheSet } from '../redis'
import {
  generateAIObject,
  generationFailure,
  streamAIObject,
  type AIUseCase,
  type GenerationRequest,
} from './generate'
import type { BuiltPrompt } from './prompts'
import { logResultWarning, resultTelemetry } from './telemetry'

/** A month. The same input replays from here, so a return visit is not billed. */
const RESULT_TTL_SECONDS = 30 * 24 * 60 * 60

export type AIResult<TObject, TContext> = {
  object: TObject
  context: TContext
}

type Stored<TObject, TContext> = AIResult<TObject, TContext> & {
  fingerprint: string
  createdAt: string
}

export function fingerprintOf(...parts: unknown[]) {
  return hash('sha256', JSON.stringify(parts), 'base64url')
}

async function readStored<TSchema extends z.ZodType, TContext>(
  useCase: AIUseCase,
  key: string,
  schema: TSchema
): Promise<Stored<z.infer<TSchema>, TContext> | null> {
  try {
    const value = await cacheGet<Stored<unknown, TContext>>(key)
    if (!value || typeof value.fingerprint !== 'string') return null
    const parsed = schema.safeParse(value.object)
    return parsed.success ? { ...value, object: parsed.data } : null
  } catch {
    logResultWarning('AI result cache read failed', useCase)
    return null
  }
}

async function writeStored<TObject, TContext>(
  useCase: AIUseCase,
  key: string,
  fingerprint: string,
  { object, context }: AIResult<TObject, TContext>
) {
  try {
    const stored: Stored<TObject, TContext> = {
      fingerprint,
      object,
      context,
      createdAt: new Date().toISOString(),
    }
    await cacheSet(key, stored, RESULT_TTL_SECONDS)
  } catch {
    // The reader still has the result. The next visit generates it again.
    logResultWarning('AI result cache write failed', useCase)
  }
}

/** The stored result for this exact input. A page view uses this and never calls the model. */
export async function storedResult<TSchema extends z.ZodType, TContext>(
  useCase: AIUseCase,
  key: string,
  schema: TSchema,
  fingerprint: string
): Promise<AIResult<z.infer<TSchema>, TContext> | null> {
  const stored = await readStored<TSchema, TContext>(useCase, key, schema)
  if (stored?.fingerprint !== fingerprint) return null
  return { object: stored.object, context: stored.context }
}

function contextEvent(context: unknown): StreamChunk {
  return {
    type: EventType.CUSTOM,
    name: AI_CONTEXT_EVENT,
    value: context,
    timestamp: Date.now(),
  }
}

/** The events a live run ends with, so the browser cannot tell a replay from generation. */
function* replay<TObject, TContext>(
  run: { threadId: string; runId: string },
  result: AIResult<TObject, TContext>
): Generator<StreamChunk> {
  const messageId = randomUUID()
  const timestamp = Date.now()
  yield { type: EventType.RUN_STARTED, ...run, timestamp }
  yield contextEvent(result.context)
  yield {
    type: EventType.CUSTOM,
    name: 'structured-output.start',
    value: { messageId },
    timestamp,
  }
  yield {
    type: EventType.CUSTOM,
    name: 'structured-output.complete',
    value: {
      object: result.object,
      raw: JSON.stringify(result.object),
      messageId,
    },
    timestamp,
  }
  yield {
    type: EventType.RUN_FINISHED,
    ...run,
    finishReason: 'stop',
    timestamp,
  }
}

export type ResultTask<TSchema extends z.ZodType, TContext> = {
  useCase: AIUseCase
  key: string
  schema: TSchema
  fingerprint: string
  force: boolean
  /** Loaded only when the model will run. Gets the result this one replaces. */
  prepare: (previous: z.infer<TSchema> | null) => Promise<{
    prompt: BuiltPrompt
    context: TContext
  }>
  /** Span attributes. Never a reader's text. */
  attributes?: Record<string, string | number>
  signal: AbortSignal
}

/** Replays the stored result for this input, or streams and stores a new one. */
export async function* resultStream<TSchema extends z.ZodType, TContext>(
  task: ResultTask<TSchema, TContext>,
  run: { threadId: string; runId: string }
): AsyncGenerator<StreamChunk> {
  const { useCase, key, schema, fingerprint, force, signal } = task
  using telemetry = resultTelemetry(useCase, task.attributes)
  try {
    const stored = await readStored<TSchema, TContext>(useCase, key, schema)
    if (!force && stored?.fingerprint === fingerprint) {
      telemetry.cache = 'hit'
      telemetry.outcome = 'cache_hit'
      yield* replay(run, stored)
      return
    }
    telemetry.cache = force ? 'bypass' : 'miss'
    const { prompt, context } = await task.prepare(stored?.object ?? null)
    let failed = false
    for await (const chunk of streamAIObject(
      { useCase, prompt, signal, run, parent: telemetry.parent },
      schema
    )) {
      if (chunk.type === EventType.RUN_ERROR) failed = true
      if (
        chunk.type === EventType.CUSTOM &&
        chunk.name === 'structured-output.complete'
      ) {
        const { object } = chunk.value as { object: z.infer<TSchema> }
        await writeStored(useCase, key, fingerprint, { object, context })
      }
      yield chunk
      if (chunk.type === EventType.RUN_STARTED) yield contextEvent(context)
    }
    telemetry.outcome = failed ? 'error' : 'generated'
  } catch (error) {
    telemetry.outcome = signal.aborted ? 'cancelled' : 'error'
    throw generationFailure(useCase, error)
  }
}

/** The same as `resultStream` for callers that want one finished object. */
export async function resultObject<TSchema extends z.ZodType, TContext>(
  task: ResultTask<TSchema, TContext>
): Promise<AIResult<z.infer<TSchema>, TContext>> {
  const { useCase, key, schema, fingerprint, force, signal } = task
  using telemetry = resultTelemetry(useCase, task.attributes)
  try {
    const stored = await readStored<TSchema, TContext>(useCase, key, schema)
    if (!force && stored?.fingerprint === fingerprint) {
      telemetry.cache = 'hit'
      telemetry.outcome = 'cache_hit'
      return { object: stored.object, context: stored.context }
    }
    telemetry.cache = force ? 'bypass' : 'miss'
    const { prompt, context } = await task.prepare(stored?.object ?? null)
    const request: GenerationRequest = {
      useCase,
      prompt,
      signal,
      parent: telemetry.parent,
    }
    const object = await generateAIObject(request, schema)
    await writeStored(useCase, key, fingerprint, { object, context })
    telemetry.outcome = 'generated'
    return { object, context }
  } catch (error) {
    telemetry.outcome = signal.aborted ? 'cancelled' : 'error'
    throw generationFailure(useCase, error)
  }
}
