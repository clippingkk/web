import { useState, useRef, useEffect, RefObject } from 'react'

export function useHover<T extends Element>() {
  const [value, setValue] = useState(false)
  const ref = useRef<T | null>(null)
  const handleMouseOver = () => setValue(true)
  const handleMouseOut = () => setValue(false)
  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }
    node.addEventListener('mouseover', handleMouseOver)
    node.addEventListener('mouseout', handleMouseOut)
    return () => {
      node.removeEventListener('mouseover', handleMouseOver)
      node.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])
  return {
    ref, 
    isHovering: value
  }
}

/**
 * A hook that handles clicks outside of the specified element
 * @param handler The function to call when a click outside occurs
 * @returns A ref that should be attached to the element you want to detect clicks outside of
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [handler])

  return ref
}
