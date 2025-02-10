'use client'

import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  /**
   * Whether the modal is currently open
   */
  isOpen: boolean
  /**
   * Callback function to be called when the modal should be closed
   */
  onClose: () => void
  /**
   * The title to display in the modal header
   */
  title?: string
  /**
   * The content to display in the modal body
   */
  children: React.ReactNode
  /**
   * Additional CSS classes to apply to the modal container
   */
  className?: string
  /**
   * Whether to show the close button in the header
   * @default true
   */
  showCloseButton?: boolean
  /**
   * Whether to close the modal when clicking outside
   * @default true
   */
  closeOnOutsideClick?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  closeOnOutsideClick = true,
}: ModalProps) {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-lg transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeOnOutsideClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full container transform rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all dark:from-gray-800/50 dark:to-gray-900/50',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100/10 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative">{children}</div>
      </div>
    </div>,
    document.querySelector('[data-id="modal"]') as HTMLElement
  )
}
