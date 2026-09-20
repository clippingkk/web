'use client'

import {
  Check,
  Copy,
  House,
  LogIn,
  RotateCw,
  TriangleAlert,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import Surface from '@/components/ui/surface/surface'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'

/**
 * React replaces every Server Components error with this placeholder in a
 * production build, so `error.message` is a dead end for the reader: it says
 * only that something failed and links to a docs page about the wrapper. The
 * digest is the part worth showing.
 */
const OPAQUE_MESSAGE = /^Minified React error #\d+/

/** ApiError messages that mean the session, not the page, is the problem. */
const AUTH_MESSAGE = /\b(sign in|signin|unauthorized|unauthenticated)\b/i

export type ErrorStateProps = {
  error: Error & { digest?: string }
  reset: () => void
  /** Full-screen for a root boundary, in-flow for a boundary inside the shell. */
  variant?: 'page' | 'inline'
  title?: string
  description?: string
}

export default function ErrorState({
  error,
  reset,
  variant = 'inline',
  title,
  description,
}: ErrorStateProps) {
  const { t } = useTranslation(undefined, 'error')
  const [copied, setCopied] = useState(false)

  const message = error.message?.trim() ?? ''
  // Only a message written for a person earns a place on screen.
  const readableMessage =
    message && !OPAQUE_MESSAGE.test(message) ? message : ''
  const isAuthError = AUTH_MESSAGE.test(message)

  const copyDigest = async () => {
    if (!error.digest) return
    try {
      await navigator.clipboard.writeText(error.digest)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard is unavailable over plain HTTP and when permission is denied;
      // the digest is selectable text either way.
    }
  }

  const card = (
    <Surface
      variant="elevated"
      className={cn(
        'with-slide-in w-full p-8',
        variant === 'page' ? 'max-w-md' : 'max-w-lg'
      )}
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-400/10 ring-1 ring-rose-400/20 dark:bg-rose-400/15">
        <TriangleAlert className="h-8 w-8 text-rose-500 dark:text-rose-300" />
      </div>

      <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900 dark:text-zinc-50">
        {title ?? t('error.title')}
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600 dark:text-zinc-400">
        {description ?? t('error.generic')}
      </p>

      {readableMessage && (
        <div className="mb-6 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-center text-sm">
          <p className="text-rose-600 dark:text-rose-300">{readableMessage}</p>
        </div>
      )}

      {error.digest && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/60">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-zinc-500">
              {t('error.reference')}
            </p>
            <p className="truncate font-mono text-sm text-gray-700 dark:text-zinc-300">
              {error.digest}
            </p>
          </div>
          <button
            type="button"
            onClick={copyDigest}
            aria-label={t('error.copy')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-all duration-200 hover:border-blue-400 hover:text-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-400 dark:hover:text-blue-300"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? t('error.copied') : t('error.copy')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
        >
          <RotateCw className="h-4 w-4" />
          {t('error.tryAgain')}
        </button>

        {isAuthError && (
          <Link
            href="/auth/auth-v4?clean=true"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-400/40 px-4 py-3 text-sm font-medium text-blue-500 transition-all duration-200 hover:bg-blue-400/10 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:text-blue-300"
          >
            <LogIn className="h-4 w-4" />
            {t('error.signIn')}
          </Link>
        )}

        <Link
          href="/"
          className="mt-1 inline-flex items-center justify-center gap-2 text-sm text-gray-600 transition-colors hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-300"
        >
          <House className="h-4 w-4" />
          {t('error.goHome')}
        </Link>
      </div>
    </Surface>
  )

  if (variant === 'inline')
    return (
      <div className="flex w-full items-center justify-center px-4 py-10">
        {card}
      </div>
    )

  return (
    <div className="anna-page-container relative min-h-screen w-full overflow-hidden">
      <DecorBlobs tone="danger" />
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
        {card}
      </div>
    </div>
  )
}
