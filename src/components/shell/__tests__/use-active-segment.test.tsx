import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useActiveSegment } from '../use-active-segment'

const navigation = vi.hoisted(() => ({
  segment: null as string | null,
  params: {} as { userid?: string },
}))

vi.mock('next/navigation', () => ({
  useSelectedLayoutSegment: () => navigation.segment,
  useParams: () => navigation.params,
}))

const viewer = { id: 42, slug: 'Reader' }

function at(userid: string | undefined, segment: string | null) {
  navigation.params = userid === undefined ? {} : { userid }
  navigation.segment = segment
}

describe('useActiveSegment', () => {
  afterEach(() => at(undefined, null))

  it('marks the showing segment active on the viewer’s own pages', () => {
    at('Reader', 'home')
    const { result } = renderHook(() => useActiveSegment(viewer))
    expect(result.current('home')).toBe(true)
    expect(result.current('upload')).toBe(false)
  })

  it('treats the numeric id and the slug as the same user', () => {
    at('42', 'upload')
    const { result } = renderHook(() => useActiveSegment(viewer))
    expect(result.current('upload')).toBe(true)
  })

  it('matches the slug case-insensitively and decodes it', () => {
    at('%52eader', 'home')
    const { result } = renderHook(() => useActiveSegment(viewer))
    expect(result.current('home')).toBe(true)
  })

  it('does not light up Library on someone else’s library', () => {
    at('someone-else', 'home')
    const { result } = renderHook(() => useActiveSegment(viewer))
    expect(result.current('home')).toBe(false)
  })

  it('keeps the square active under any user slug', () => {
    at('someone-else', 'square')
    const { result } = renderHook(() => useActiveSegment(viewer))
    expect(result.current('square')).toBe(true)
  })

  it('only marks the square for signed-out visitors', () => {
    at('Reader', 'home')
    const signedOut = renderHook(() => useActiveSegment(null))
    expect(signedOut.result.current('home')).toBe(false)

    at('Reader', 'square')
    const onSquare = renderHook(() => useActiveSegment(null))
    expect(onSquare.result.current('square')).toBe(true)
  })
})
