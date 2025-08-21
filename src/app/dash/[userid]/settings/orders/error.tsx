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
    <div className='p-6 w-full'>
      <div className='flex flex-col items-center text-center'>
        {/* Error icon */}
        <div className='p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-6 animate-pulse'>
          <AlertTriangle className='w-10 h-10 text-red-600 dark:text-red-400' />
        </div>

        {/* Error heading */}
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
          {t('app.error.title', 'Something went wrong')}
        </h2>

        {/* Error message - Styled differently based on if we have structured error data */}
        {parsedError ? (
          <div className='w-full max-w-md mx-auto mb-6'>
            <div className='bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
              {/* Error header with status code */}
              <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/50 dark:bg-gray-700/30'>
                <div className='flex items-center'>
                  <AlertCircle className='w-5 h-5 text-red-500 mr-2' />
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {parsedError.code || 'Error'}
                  </span>
                </div>
                {parsedError.status && (
                  <span className='px-2 py-1 text-xs font-semibold rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'>
                    Status {parsedError.status}
                  </span>
                )}
              </div>

              {/* Error message */}
              <div className='p-4 text-left'>
                <p className='text-gray-800 dark:text-gray-200 mb-4'>
                  {parsedError.message}
                </p>

                {/* Additional details */}
                <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  {parsedError.param && (
                    <div className='flex'>
                      <span className='font-medium w-24'>Parameter:</span>{' '}
                      {parsedError.param}
                    </div>
                  )}
                  {parsedError.request_id && (
                    <div className='flex'>
                      <span className='font-medium w-24'>Request ID:</span>{' '}
                      {parsedError.request_id}
                    </div>
                  )}
                  {parsedError.type && (
                    <div className='flex'>
                      <span className='font-medium w-24'>Error type:</span>{' '}
                      {parsedError.type}
                    </div>
                  )}
                </div>
              </div>

              {/* Documentation link if available */}
              {parsedError.doc_url && (
                <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800/30'>
                  <a
                    href={parsedError.doc_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 dark:text-blue-400 flex items-center justify-center hover:underline'
                  >
                    <HelpCircle className='w-4 h-4 mr-1' />
                    View documentation
                    <ExternalLink className='w-3 h-3 ml-1' />
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className='text-gray-600 dark:text-gray-300 mb-6'>
            {error?.message ||
              t(
                'app.error.default',
                'We encountered an error while loading your order history.'
              )}
          </p>
        )}

        {/* Divider */}
        <div className='w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-6'></div>

        {/* Reset button - removed gradients */}
        <button
          onClick={() => reset()}
          className='flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 active:scale-95'
        >
          <RefreshCw className='w-4 h-4' />
          {t('app.common.tryAgain', 'Try Again')}
        </button>
      </div>
    </div>
  )
}
