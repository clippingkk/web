import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getLocalToken, resolveApiBase } from '@/services/ajax'

class AIRequestError extends Error {}

/** Surface the app's actionable API errors instead of a generic HTTP status. */
export const aiFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new AIRequestError(
      body?.msg || 'AI generation failed. Please try again.'
    )
  }
  return response
}

export function useAIGeneration(
  kind: 'passage' | 'recommendations',
  input: Record<string, unknown>,
  enabled: boolean
) {
  const [requestError, setRequestError] = useState<Error | undefined>()
  const serialized = JSON.stringify(input)
  const requestRef = useRef({ kind, serialized })
  const connection = useMemo(
    () =>
      fetchServerSentEvents(
        () => `${resolveApiBase()}/api/v2/ai/${requestRef.current.kind}`,
        () => ({
          headers: { Authorization: `Bearer ${getLocalToken()}` },
          body: JSON.parse(requestRef.current.serialized),
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
    [requestRef, setRequestError]
  )
  const { messages, isLoading, error, sendMessage, stop, clear } = useChat({
    connection,
  })

  useEffect(() => {
    requestRef.current = { kind, serialized }
    clear()
    if (!enabled) return
    // Deferring one tick prevents React Strict Mode's discarded effect from starting a paid request.
    const timer = setTimeout(() => {
      setRequestError(undefined)
      void sendMessage('Generate').catch(() => {})
    }, 0)
    return () => {
      clearTimeout(timer)
      stop()
    }
  }, [
    enabled,
    serialized,
    kind,
    sendMessage,
    stop,
    clear,
    requestRef,
    setRequestError,
  ])

  const text = enabled
    ? messages
        .filter((message) => message.role === 'assistant')
        .flatMap((message) => message.parts)
        .map((part) => (part.type === 'text' ? part.content : ''))
        .join('')
    : ''
  return {
    text,
    isLoading,
    error: enabled ? (requestError ?? error) : undefined,
  }
}
