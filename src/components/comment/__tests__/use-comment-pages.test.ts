import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CommentItemData } from '../comment-item'
import { useCommentPages } from '../use-comment-pages'

const query = vi.hoisted(() => vi.fn())

vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query }),
}))

function comments(...ids: number[]) {
  return ids.map((id) => ({ id }) as CommentItemData)
}

function page(items: CommentItemData[], count = 0) {
  return { data: { getCommentList: { items, count } } }
}

describe('useCommentPages', () => {
  beforeEach(() => query.mockReset())

  it('appends the next page after the last id, skipping repeats', async () => {
    query.mockResolvedValue(page(comments(2, 3, 4)))
    const { result } = renderHook(() =>
      useCommentPages({
        cid: 7,
        initialItems: comments(1, 2),
        initialCount: 10,
        pageSize: 3,
      })
    )

    await act(() => result.current.loadMore())

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          cid: 7,
          uid: undefined,
          pagination: { limit: 3, lastId: 2 },
        },
      })
    )
    expect(result.current.items.map((c) => c.id)).toEqual([1, 2, 3, 4])
    expect(result.current.hasMore).toBe(true)
  })

  it('stops offering more once a short page ends the list', async () => {
    query.mockResolvedValue(page(comments(3)))
    const { result } = renderHook(() =>
      useCommentPages({
        uid: 5,
        initialItems: comments(1, 2),
        // stale: two comments were deleted since the count was taken
        initialCount: 5,
        pageSize: 3,
      })
    )

    await act(() => result.current.loadMore())

    expect(result.current.count).toBe(3)
    expect(result.current.hasMore).toBe(false)
  })

  it('drops a deleted comment from the list and the count', () => {
    const { result } = renderHook(() =>
      useCommentPages({
        cid: 7,
        initialItems: comments(1, 2),
        initialCount: 2,
        pageSize: 3,
      })
    )

    act(() => result.current.remove(1))

    expect(result.current.items.map((c) => c.id)).toEqual([2])
    expect(result.current.count).toBe(1)
  })

  it('reload replaces the list with the first page', async () => {
    query.mockResolvedValue(page(comments(9, 1), 2))
    const { result } = renderHook(() =>
      useCommentPages({
        cid: 7,
        initialItems: comments(1),
        initialCount: 1,
        pageSize: 3,
      })
    )

    await act(() => result.current.reload())

    expect(result.current.items.map((c) => c.id)).toEqual([9, 1])
    expect(result.current.count).toBe(2)
  })
})
