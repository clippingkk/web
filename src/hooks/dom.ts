import { useState, useRef, useEffect } from "react"

export function useHover<T extends Element>() {
  const [value, setValue] = useState(false)
  const ref = useRef<T | null>(null)
  const handleMouseOver = () => setValue(true)
  const handleMouseOut = () => setValue(false)
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return
    }
    node.addEventListener("mouseover", handleMouseOver)
    node.addEventListener("mouseout", handleMouseOut)
    return () => {
      node.removeEventListener("mouseover", handleMouseOver)
      node.removeEventListener("mouseout", handleMouseOut)
    }
  }, [])
  return {
    ref, 
    isHovering: value
  }
}
