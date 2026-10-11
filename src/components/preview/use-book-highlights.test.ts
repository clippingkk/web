import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

import { useBookHighlights } from './use-book-highlights'

// Apollo hands out one client for the app's lifetime.
const client = vi.hoisted(() => ({ query: vi.fn() }))
const query = client.query
vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => client,
}))

const clipping = (id: number, visible = true) => ({
  id,
  title: 'Book',
  content: `Highlight number ${id} of this book.`,
  bookID: '12',
  pageAt: '',
  createdAt: '',
  visible,
})

beforeEach(() => query.mockReset())

it('samples public highlights from a random page of the shelf', async () => {
  query.mockResolvedValue({
    data: {
      book: {
        clippings: [
          clipping(1),
          clipping(2, false),
          clipping(3),
          clipping(4),
          clipping(5),
        ],
      },
    },
  })
  const { result } = renderHook(() =>
    useBookHighlights({ bookId: 12, uid: 7, total: 5, enabled: true })
  )
  expect(result.current.status).toBe('loading')
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(query).toHaveBeenCalledWith(
    expect.objectContaining({
      variables: { id: 12, uid: 7, pagination: { limit: 100, offset: 0 } },
      fetchPolicy: 'network-only',
    })
  )
  expect(result.current.highlights).toHaveLength(3)
  expect(result.current.highlights.map((item) => item.id)).not.toContain(2)
  expect(result.current.canShuffle).toBe(true)
  const before = result.current.highlights.map((item) => item.id)
  act(() => result.current.shuffle())
  expect(result.current.highlights.map((item) => item.id)).not.toEqual(before)
})

it('reports a failed load and retries', async () => {
  query.mockRejectedValueOnce(new Error('offline'))
  query.mockResolvedValueOnce({
    data: { book: { clippings: [clipping(1)] } },
  })
  const { result } = renderHook(() =>
    useBookHighlights({ bookId: 12, uid: 7, total: 1, enabled: true })
  )
  await waitFor(() => expect(result.current.status).toBe('error'))
  act(() => result.current.retry())
  expect(result.current.status).toBe('loading')
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(result.current.highlights).toHaveLength(1)
  expect(result.current.canShuffle).toBe(false)
})

it('stays idle for clipping shares', () => {
  const { result } = renderHook(() =>
    useBookHighlights({ bookId: 12, uid: 7, total: 5, enabled: false })
  )
  expect(result.current.status).toBe('idle')
  expect(query).not.toHaveBeenCalled()
})
