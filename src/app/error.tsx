'use client'

import { AlertTriangle, RotateCw, Home } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* Background with gradient orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900"></div>
        
        {/* Gradient orbs using the primary color #045fab */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-[#045fab]/30 to-purple-600/20 blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-[#045fab]/20 to-blue-400/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 h-60 w-60 rounded-full bg-gradient-to-tr from-[#045fab]/10 to-cyan-400/10 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen w-full flex-col items-center justify-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/5 p-8 backdrop-blur-lg">
          {/* ClippingKK logo/title */}
          <h2 className="font-lato mb-6 bg-gradient-to-r from-blue-300 to-[#045fab] bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent">
            ClippingKK
          </h2>
          
          {/* Error icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 p-4">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          
          {/* Error title */}
          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            {t('error.title') || 'Something went wrong!'}
          </h1>
          
          {/* Error message with blur effect */}
          <div className="mb-8 mt-4 rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-center text-sm backdrop-blur-sm">
            <p className="text-red-200">
              {error.message || t('error.generic')}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-400">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="group relative overflow-hidden rounded-lg bg-[#045fab] px-4 py-3 text-center font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[#045fab]/30 hover:shadow-xl active:translate-y-0"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <RotateCw className="h-4 w-4" />
                {t('error.tryAgain') || 'Try again'}
              </span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-[#045fab] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </button>
            
            <Link
              href="/"
              className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-blue-300 transition-colors hover:text-white"
            >
              <Home className="h-4 w-4" />
              {t('error.goHome') || 'Return to home page'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
