'use client' // Error boundaries must be Client Components
import {
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  RefreshCw,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { useTranslation } from '@/i18n/client'

type StripeError = {
  code: string
  doc_url?: string
  status?: number
  message: string
  param?: string
  request_id?: string
  request_log_url?: string
  type?: string
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  // Try to parse the error message as JSON if it's a string
  const parsedError = useMemo(() => {
    try {
      if (typeof error?.message === 'string') {
        // Check if it looks like JSON
        if (
          error.message.trim().startsWith('{') &&
          error.message.trim().endsWith('}')
        ) {
          return JSON.parse(error.message) as StripeError
        }
      }
      return null
    } catch (e: unknown) {
      console.error(e)
      // If parsing fails, just return null
      return null
    }
  }, [error])

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
    console.error('Parsed error:', parsedError)
  }, [error, parsedError])

  return (
    <div className="w-full p-6">
      <div className="flex flex-col items-center text-center">
        {/* Error icon */}
        <div className="mb-6 animate-pulse rounded-full bg-red-100 p-4 dark:bg-red-900/30">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Error heading */}
        <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          {t('app.error.title', 'Something went wrong')}
        </h2>

        {/* Error message - Styled differently based on if we have structured error data */}
        {parsedError ? (
          <div className="mx-auto mb-6 w-full max-w-md">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">
              {/* Error header with status code */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-white/50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {parsedError.code || 'Error'}
                  </span>
                </div>
                {parsedError.status && (
                  <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Status {parsedError.status}
                  </span>
                )}
              </div>

              {/* Error message */}
              <div className="p-4 text-left">
                <p className="mb-4 text-gray-800 dark:text-gray-200">
                  {parsedError.message}
                </p>

                {/* Additional details */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {parsedError.param && (
                    <div className="flex">
                      <span className="w-24 font-medium">Parameter:</span>{' '}
                      {parsedError.param}
                    </div>
                  )}
                  {parsedError.request_id && (
                    <div className="flex">
                      <span className="w-24 font-medium">Request ID:</span>{' '}
                      {parsedError.request_id}
                    </div>
                  )}
                  {parsedError.type && (
                    <div className="flex">
                      <span className="w-24 font-medium">Error type:</span>{' '}
                      {parsedError.type}
                    </div>
                  )}
                </div>
              </div>

              {/* Documentation link if available */}
              {parsedError.doc_url && (
                <div className="border-t border-blue-100 bg-blue-50 p-3 dark:border-blue-800/30 dark:bg-blue-900/20">
                  <a
                    href={parsedError.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <HelpCircle className="mr-1 h-4 w-4" />
                    View documentation
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {error?.message ||
              t(
                'app.error.default',
                'We encountered an error while loading your order history.'
              )}
          </p>
        )}

        {/* Divider */}
        <div className="mb-6 h-1 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>

        {/* Reset button - removed gradients */}
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-95 active:bg-blue-800 dark:focus:ring-offset-gray-900"
        >
          <RefreshCw className="h-4 w-4" />
          {t('app.common.tryAgain', 'Try Again')}
        </button>
      </div>
    </div>
  )
}
