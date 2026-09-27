import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useDebouncedValue } from '../use-debounced-value'

describe('useDebouncedValue', () => {
  afterEach(() => vi.useRealTimers())

  it('starts with the initial value and settles on the last one', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'du' } }
    )
    expect(result.current).toBe('du')

    rerender({ value: 'dun' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'dune' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('du')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('dune')
  })
})
