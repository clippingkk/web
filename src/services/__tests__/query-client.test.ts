// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { createReactQueryClient } from '../query-client'
import { duration3Days, wenquBooksByIdsQueryOptions } from '../wenqu'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

it('still evicts default browser queries after five seconds', async () => {
  const client = createReactQueryClient()
  expect(client.getDefaultOptions().queries?.staleTime).toBe(60 * 60)
  await client.fetchQuery({ queryKey: ['test'], queryFn: async () => 'data' })
  vi.advanceTimersByTime(4999)
  expect(client.getQueryData(['test'])).toBe('data')
  vi.advanceTimersByTime(1)
  expect(client.getQueryData(['test'])).toBeUndefined()
})

it('retains browser book queries for three days', async () => {
  const client = createReactQueryClient()
  const options = wenquBooksByIdsQueryOptions(['1234'])
  expect(options.staleTime).toBe(duration3Days)
  await client.fetchQuery({
    ...options,
    queryFn: async () => ({ count: 0, books: [] }),
  })
  vi.advanceTimersByTime(duration3Days - 1)
  expect(client.getQueryData(options.queryKey)).toEqual({ count: 0, books: [] })
  vi.advanceTimersByTime(1)
  expect(client.getQueryData(options.queryKey)).toBeUndefined()
})
