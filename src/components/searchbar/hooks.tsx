import { useEffect, useState } from 'react'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

export function useCtrlP() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // For Ctrl+P (Windows/Linux) or Cmd+P (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault() // Prevent browser's print dialog
        setVisible(true)
      }
      // For Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setVisible(true)
      }
      // Close on ESC key press if currently visible
      if (event.key === 'Escape') {
        setVisible(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (visible) {
      disableBodyScroll(document.body)
    } else {
      enableBodyScroll(document.body)
    }
  }, [visible])

  return {
    visible,
    setVisible
  }
}
