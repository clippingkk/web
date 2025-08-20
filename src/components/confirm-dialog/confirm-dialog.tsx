'use client'

import {
  autoUpdate,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react'
import { motion } from 'motion/react'
import { type ReactNode, useState } from 'react'

export interface ConfirmOptions {
  title?: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
  cancelButtonClass?: string
  icon?: ReactNode
  variant?: 'danger' | 'warning' | 'info'
  children?: ReactNode
}

interface ConfirmDialogProps extends ConfirmOptions {
  // isOpen: boolean
  onConfirm: () => void
  onCancel?: () => void
}

const variantStyles = {
  danger: {
    icon: (
      <svg
        className="w-6 h-6 text-red-600 dark:text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: (
      <svg
        className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    icon: (
      <svg
        className="w-6 h-6 text-blue-600 dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
}

function ConfirmDialog({
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass,
  cancelButtonClass,
  icon,
  variant = 'danger',
  children,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const onHandleCancel = () => {
    setIsOpen(false)
    onCancel?.()
  }
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      setIsOpen(open)
      if (!open) onCancel?.()
    },
    middleware: [offset(15), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const variantStyle = variantStyles[variant]

  return (
    <>
      <div
        ref={refs.setReference}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {isOpen && (
        <FloatingPortal>
          <FloatingOverlay
            className="bg-black/50 backdrop-blur-sm z-50"
            lockScroll
          />
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles }}
              className="z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

                <div className="relative p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      {icon || variantStyle.icon}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {title}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {message}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <button
                      onClick={onHandleCancel}
                      className={
                        cancelButtonClass ||
                        'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'
                      }
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={onConfirm}
                      className={
                        confirmButtonClass ||
                        `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${variantStyle.buttonClass}`
                      }
                    >
                      {confirmText}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}

export default ConfirmDialog
