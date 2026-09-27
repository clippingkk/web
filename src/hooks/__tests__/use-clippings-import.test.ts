import fs from 'node:fs'
import path from 'node:path'

import { QueryClient } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UploadStep } from '@/services/uploader'
import ClippingTextParser from '@/store/clippings/parser'

import { useClippingsImport } from '../use-clippings-import'

const mocks = vi.hoisted(() => ({
  createClippings: vi.fn(),
  onSyncEnd: vi.fn(),
  resetStore: vi.fn(),
  wenquRequest: vi.fn(),
}))

vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ resetStore: mocks.resetStore }),
  useMutation: (doc: { definitions: { name?: { value: string } }[] }) => [
    doc.definitions[0]?.name?.value === 'onSyncEnd'
      ? mocks.onSyncEnd
      : mocks.createClippings,
  ],
}))

vi.mock('@/services/wenqu', () => ({ wenquRequest: mocks.wenquRequest }))

vi.mock('@/services/ajax', () => ({
  getReactQueryClient: () => new QueryClient(),
}))

const fixture = fs
  .readFileSync(
    path.resolve(
      __dirname,
      '../../store/clippings/__fixtures__/clippings_en.txt'
    )
  )
  .toString()
const highlights = new ClippingTextParser(fixture).execute()
const titles = new Set(highlights.map((h) => h.title))

function kindleExport() {
  return new File([fixture], 'My Clippings.txt', { type: 'text/plain' })
}

function sentHighlights() {
  return mocks.createClippings.mock.calls.flatMap(
    ([options]) => options.variables.payload
  )
}

describe('useClippingsImport', () => {
  beforeEach(() => {
    localStorage.clear()
    for (const fn of Object.values(mocks)) fn.mockReset()
    mocks.createClippings.mockResolvedValue({ data: { createClippings: [] } })
    mocks.onSyncEnd.mockResolvedValue({ data: {} })
    mocks.wenquRequest.mockResolvedValue({
      count: 1,
      books: [{ doubanId: 1234 }],
    })
  })

  it('matches each title once and uploads in batches of 20', async () => {
    expect(highlights.length).toBeGreaterThan(20)
    const { result } = renderHook(() => useClippingsImport())

    await act(() => result.current.start(kindleExport(), { visible: false }))

    expect(result.current.step).toBe(UploadStep.Done)
    expect(result.current.result).toEqual({
      imported: highlights.length,
      duplicates: 0,
    })
    expect(mocks.wenquRequest).toHaveBeenCalledTimes(titles.size)
    expect(mocks.createClippings).toHaveBeenCalledTimes(
      Math.ceil(highlights.length / 20)
    )
    for (const [options] of mocks.createClippings.mock.calls) {
      expect(options.variables.payload.length).toBeLessThanOrEqual(20)
      expect(options.variables.visible).toBe(false)
    }
    expect(sentHighlights().every((h) => h.bookID === '1234')).toBe(true)
    expect(mocks.onSyncEnd).toHaveBeenCalledTimes(1)
  })

  it('skips highlights this browser already imported', async () => {
    const { result } = renderHook(() => useClippingsImport())
    await act(() => result.current.start(kindleExport(), { visible: true }))
    act(() => result.current.reset())
    mocks.createClippings.mockClear()
    mocks.onSyncEnd.mockClear()

    await act(() => result.current.start(kindleExport(), { visible: true }))

    expect(result.current.result).toEqual({
      imported: 0,
      duplicates: highlights.length,
    })
    expect(mocks.createClippings).not.toHaveBeenCalled()
    expect(mocks.onSyncEnd).not.toHaveBeenCalled()
  })

  it('keeps the batches saved before a failure, so a retry sends only the rest', async () => {
    mocks.createClippings
      .mockResolvedValueOnce({ data: { createClippings: [] } })
      .mockRejectedValueOnce(new Error('server down'))
    const { result } = renderHook(() => useClippingsImport())

    await act(() => result.current.start(kindleExport(), { visible: true }))

    expect(result.current.step).toBe(UploadStep.Error)
    expect(result.current.errors).toEqual([
      { kind: 'upload', message: 'server down' },
    ])
    expect(mocks.onSyncEnd).not.toHaveBeenCalled()

    act(() => result.current.reset())
    mocks.createClippings.mockReset()
    mocks.createClippings.mockResolvedValue({ data: { createClippings: [] } })

    await act(() => result.current.start(kindleExport(), { visible: true }))

    expect(result.current.result).toEqual({
      imported: highlights.length - 20,
      duplicates: 20,
    })
  })

  it('carries on without a book when matching fails', async () => {
    mocks.wenquRequest.mockRejectedValue(new Error('wenqu timeout'))
    const { result } = renderHook(() => useClippingsImport())

    await act(() => result.current.start(kindleExport(), { visible: true }))

    expect(result.current.step).toBe(UploadStep.Done)
    expect(result.current.errors.every((e) => e.kind === 'search')).toBe(true)
    expect(sentHighlights()).toHaveLength(highlights.length)
    expect(sentHighlights().some((h) => h.bookID === '1234')).toBe(false)
  })

  it('reports a file it cannot open as a read error, not a parse error', async () => {
    const file = kindleExport()
    file.text = () => Promise.reject(new Error('NotReadableError'))
    const { result } = renderHook(() => useClippingsImport())

    await act(() => result.current.start(file, { visible: true }))

    expect(result.current.step).toBe(UploadStep.Error)
    expect(result.current.errors).toEqual([
      { kind: 'read', message: 'NotReadableError' },
    ])
    expect(mocks.createClippings).not.toHaveBeenCalled()
  })
})
