import { ArrowRight, ExternalLink, LogIn, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import Surface from '@/components/ui/surface/surface'

function AuthCardFrame({ children }: { children: ReactNode }) {
  return (
    <Surface variant="elevated" className="w-full p-6 sm:p-9">
      <span className="mb-6 inline-flex rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
        <LogIn aria-hidden className="size-6" />
      </span>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Sign in to ClippingKK
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Your Evonia Gate account connects you to ClippingKK. Your books and
        clippings stay here.
      </p>
      {children}
    </Surface>
  )
}

export function AuthCardLoading() {
  return (
    <AuthCardFrame>
      <div className="mt-8">
        <output className="sr-only">Loading sign-in options…</output>
        <div aria-hidden className="motion-safe:animate-pulse">
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="mx-auto mt-5 h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-8 border-t border-slate-200/70 pt-6 dark:border-slate-700/70">
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-4 w-3/5 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </AuthCardFrame>
  )
}

export default function AuthCard({
  error,
  next,
  accountUrl,
}: {
  error?: string
  next?: string
  accountUrl: string
}) {
  return (
    <AuthCardFrame>
      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
        >
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p>
            {error === 'EMAIL_VERIFICATION_REQUIRED'
              ? 'Verify your email in Gate, then try again.'
              : error === 'FORBIDDEN'
                ? 'Your ClippingKK access has been removed. Contact support to restore access.'
                : error === 'ACCOUNT_RECOVERY_REQUIRED'
                  ? 'We could not safely link your existing account. Contact support to recover your clippings.'
                  : 'Sign-in could not be completed. Please try again.'}
          </p>
        </div>
      )}
      <a
        className="mt-8 flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/15 outline-offset-4 hover:from-blue-700 hover:to-indigo-700 focus-visible:outline-2 focus-visible:outline-blue-500 motion-safe:transition-colors"
        href={`/api/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
      >
        Continue with Gate
        <ArrowRight aria-hidden className="size-5" />
      </a>
      <a
        className="mx-auto mt-4 flex min-h-11 w-fit items-center gap-2 rounded text-sm font-medium text-slate-600 outline-offset-4 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-300 dark:hover:text-blue-300"
        href={accountUrl}
      >
        Manage your Gate account
        <ExternalLink aria-hidden className="size-3.5" />
      </a>
      <p className="mt-6 border-t border-slate-200/70 pt-6 text-sm leading-relaxed text-slate-500 dark:border-slate-700/70 dark:text-slate-400">
        Previously used phone, WeChat, a wallet, or a different Apple email?{' '}
        <a
          className="rounded font-medium text-blue-700 underline decoration-blue-500/30 underline-offset-4 outline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-blue-300"
          href="mailto:iamhele1994@gmail.com"
        >
          Contact support
        </a>{' '}
        to verify and recover your old account.
      </p>
    </AuthCardFrame>
  )
}
