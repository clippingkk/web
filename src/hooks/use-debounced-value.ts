import { useEffect, useState } from 'react'

/**
 * `value`, once it has held still for `delay` ms. Unlike useDeferredValue,
 * this cuts the number of values (and so of network requests) per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return settled
}
