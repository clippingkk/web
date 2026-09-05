// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'

import { wenquRequest } from '../wenqu'

afterEach(() => vi.unstubAllGlobals())

it('delegates repeated URLs to fetch instead of retaining responses indefinitely', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ count: 1, books: [{ title: 'first' }] })
    )
    .mockResolvedValueOnce(
      Response.json({ count: 1, books: [{ title: 'updated' }] })
    )
  vi.stubGlobal('fetch', fetchMock)
  const url = '/books/search?dbId=1234'
  expect(await wenquRequest(url)).toEqual({
    count: 1,
    books: [{ title: 'first' }],
  })
  expect(await wenquRequest(url)).toEqual({
    count: 1,
    books: [{ title: 'updated' }],
  })
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(fetchMock).toHaveBeenLastCalledWith(
    expect.stringContaining(url),
    expect.objectContaining({
      next: { revalidate: 3600 },
      credentials: 'include',
      mode: 'cors',
    })
  )
})

it('propagates API and network errors and allows a subsequent retry', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ code: 500, error: 'API unavailable' })
    )
    .mockRejectedValueOnce(new Error('network unavailable'))
    .mockResolvedValueOnce(Response.json({ count: 0, books: [] }))
  vi.stubGlobal('fetch', fetchMock)
  const url = '/books/search?dbId=5678'
  await expect(wenquRequest(url)).rejects.toThrow('API unavailable')
  await expect(wenquRequest(url)).rejects.toThrow('network unavailable')
  await expect(wenquRequest(url)).resolves.toEqual({ count: 0, books: [] })
})
