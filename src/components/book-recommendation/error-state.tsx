import React from 'react'

interface ErrorStateProps {
  error: Error
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
      <p className="font-medium text-lg text-red-800 dark:text-red-200">
        {error.message}
      </p>
      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
        - AI Assistant
      </p>
    </div>
  )
}
