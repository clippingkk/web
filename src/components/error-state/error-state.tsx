'use client'

import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import {
  Check,
  Copy,
  House,
  LogIn,
  RotateCw,
  TriangleAlert,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import Brand from '@/components/shell/brand'
import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'

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
  const pathname = usePathname()
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

  const details = (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      {readableMessage ? (
        <p className="rounded-lake-control bg-lake-danger-soft text-lake-danger w-full px-4 py-3 text-center text-sm">
          {readableMessage}
        </p>
      ) : null}

      {error.digest ? (
        <div className="rounded-lake-control border-lake-line bg-lake-surface flex w-full items-center justify-between gap-3 border py-2 pr-2 pl-4 text-left">
          <div className="min-w-0">
            <p className="type-meta">{t('error.reference')}</p>
            <p className="text-lake-fg-muted truncate font-mono text-sm select-all">
              {error.digest}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyDigest}
            leadingIcon={
              copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )
            }
          >
            {copied ? t('error.copied') : t('error.copy')}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="primary"
          onClick={() => reset()}
          leadingIcon={<RotateCw className="size-4" />}
        >
          {t('error.tryAgain')}
        </Button>
        {isAuthError ? (
          <Button
            variant="secondary"
            leadingIcon={<LogIn className="size-4" />}
            render={<Link href={authHref(pathname)} />}
          >
            {t('error.signIn')}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          leadingIcon={<House className="size-4" />}
          render={<Link href="/" />}
        >
          {t('error.goHome')}
        </Button>
      </div>
    </div>
  )

  const state = (
    <EmptyState
      icon={<TriangleAlert className="size-6" />}
      title={title ?? t('error.title')}
      description={description ?? t('error.generic')}
      action={details}
      headingLevel={variant === 'page' ? 1 : 2}
    />
  )

  if (variant === 'inline')
    return (
      <div className="mx-auto flex w-full max-w-3xl justify-center px-4 py-16 sm:px-6">
        {state}
      </div>
    )

  return (
    <div className="bg-lake-canvas text-lake-fg flex min-h-dvh w-full flex-col">
      <header className="mx-auto flex h-14 w-full max-w-5xl items-center px-4 sm:px-6">
        <Brand href="/" />
      </header>
      <main
        id="main"
        className="flex flex-1 items-center justify-center px-4 py-12"
      >
        {state}
      </main>
    </div>
  )
}
