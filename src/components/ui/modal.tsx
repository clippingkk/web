'use client'

import { useCallback, useEffect, useState } from 'react'
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

  const [isVisible, setIsVisible] = useState(false)
  const [isRendered, setIsRendered] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      // Delay visibility for enter animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    } else {
      setIsVisible(false)
      // Delay unmount for exit animation
      const timer = setTimeout(() => {
        setIsRendered(false)
      }, 200) // Match this with the transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isRendered) return null

  return createPortal(
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8',
        'transition-[opacity,visibility] duration-200',
        isVisible ? 'visible opacity-100' : 'invisible opacity-0'
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-lg',
          'transition-[opacity,backdrop-filter] duration-200 ease-in-out',
          isVisible ? 'opacity-100 backdrop-blur-lg' : 'opacity-0 backdrop-blur-none'
        )}
        onClick={closeOnOutsideClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-h-[90vh] container transform rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl dark:from-gray-800/50 dark:to-gray-900/50 overflow-hidden',
          'transition-all duration-200 ease-out',
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4',
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
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50 [&::-webkit-scrollbar-track]:bg-gray-100/50 dark:[&::-webkit-scrollbar-track]:bg-gray-800/50 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500/50">{children}</div>
      </div>
    </div>,
    document.querySelector('[data-id="modal"]') as HTMLElement
  )
}
