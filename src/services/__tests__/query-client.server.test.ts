// @vitest-environment node
import { dehydrate } from '@tanstack/react-query'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { createReactQueryClient } from '../query-client'
import { wenquBooksByIdsQueryOptions } from '../wenqu'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('does not retain completed request caches through GC timers', async () => {
  for (let request = 0; request < 100; request++) {
    const client = createReactQueryClient()
    await client.fetchQuery({
      queryKey: ['request', request],
      queryFn: async () => ({ request }),
    })
    expect(dehydrate(client).queries[0].state.data).toEqual({ request })
  }
  expect(vi.getTimerCount()).toBe(0)
})

it('keeps book prefetches hydratable without scheduling three-day timers', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ count: 0, books: [] }))
  )
  for (let request = 0; request < 100; request++) {
    const client = createReactQueryClient()
    const options = wenquBooksByIdsQueryOptions([String(1000 + request)])
    await client.prefetchQuery(options)
    const state = dehydrate(client)
    expect(state.queries).toHaveLength(1)
    expect(state.queries[0].queryKey).toEqual(options.queryKey)
    expect(state.queries[0].state.data).toEqual({ count: 0, books: [] })
  }
  expect(vi.getTimerCount()).toBe(0)
})

it('does not leave GC timers after failed queries', async () => {
  const client = createReactQueryClient()
  await expect(
    client.fetchQuery({
      ...wenquBooksByIdsQueryOptions(['1234']),
      queryFn: async () => {
        throw new Error('upstream unavailable')
      },
      retry: false,
    })
  ).rejects.toThrow('upstream unavailable')
  expect(vi.getTimerCount()).toBe(0)
})

it('keeps separate requests isolated', async () => {
  const first = createReactQueryClient()
  const second = createReactQueryClient()
  first.setQueryData(['private'], { userId: 1 })
  expect(second.getQueryData(['private'])).toBeUndefined()
})
