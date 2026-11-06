import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { z } from 'zod'

import { AI_CONTEXT_EVENT } from '@/lib/ai/schemas'
import { resolveApiBase } from '@/services/ajax'

export type AIKind = 'passage' | 'recommendations' | 'book'

export type AIResult<TObject, TContext> = {
  object: TObject
  context: TContext
}

type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

export class AIRequestError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.code = code
  }
}

/** Keeps the API's error code, which the UI turns into a translated message. */
export const aiFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new AIRequestError(
      body?.msg || 'AI generation failed. Please try again.',
      body?.code
    )
  }
  return response
}

type UseAIObjectOptions<TSchema extends z.ZodType, TContext> = {
  kind: AIKind
  schema: TSchema
  /** Stable for what is being generated, for example the book's id. */
  threadId: string
  /** A result the server already had, shown without calling the model. */
  initial?: AIResult<z.infer<TSchema>, TContext> | null
}

/**
 * One AI result that streams in field by field. Nothing is sent until
 * `generate` is called, so a render can never start a paid request.
 */
export function useAIObject<TSchema extends z.ZodType, TContext = null>({
  kind,
  schema,
  threadId,
  initial = null,
}: UseAIObjectOptions<TSchema, TContext>) {
  type TObject = z.infer<TSchema>
  const [result, setResult] = useState(initial)
  const [liveContext, setLiveContext] = useState<TContext | null>(null)
  const [requestError, setRequestError] = useState<Error>()
  const inputRef = useRef<Record<string, unknown>>({})
  // The context event always comes first, so the finished result can pair with it.
  const contextRef = useRef<TContext | null>(null)

  const connection = useMemo(
    () =>
      fetchServerSentEvents(
        () => `${resolveApiBase()}/api/v2/ai/${kind}`,
        () => ({
          body: inputRef.current,
          fetchClient: async (url, options) => {
            try {
              return await aiFetch(url, options)
            } catch (error) {
              if (!options?.signal?.aborted && error instanceof AIRequestError)
                setRequestError(error)
              throw error
            }
          },
        })
      ),
    [kind, inputRef, setRequestError]
  )

  const { partial, isLoading, error, sendMessage, stop, clear } = useChat({
    connection,
    threadId,
    outputSchema: schema,
    onChunk: (chunk) => {
      if (chunk.type !== 'CUSTOM') return
      if (chunk.name === AI_CONTEXT_EVENT) {
        contextRef.current = chunk.value as TContext
        setLiveContext(contextRef.current)
      }
      if (chunk.name === 'structured-output.complete') {
        setResult({
          object: (chunk.value as { object: TObject }).object,
          context: contextRef.current as TContext,
        })
      }
    },
  })

  const generate = useCallback(
    (input: Record<string, unknown> = {}) => {
      inputRef.current = input
      contextRef.current = null
      setRequestError(undefined)
      setLiveContext(null)
      stop()
      clear()
      void sendMessage('Generate', { whenBusy: 'interrupt' }).catch(() => {})
    },
    [sendMessage, stop, clear, inputRef, contextRef, setRequestError]
  )

  const hasDraft = isLoading && Object.keys(partial ?? {}).length > 0
  return {
    /** The latest finished result. */
    result,
    /** The result still being written, once its first field has arrived. */
    draft: hasDraft ? (partial as DeepPartial<TObject>) : null,
    context: liveContext ?? result?.context ?? null,
    isLoading,
    error: requestError ?? error,
    generate,
    stop,
  }
}
