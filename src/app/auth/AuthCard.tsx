import { buttonStyles } from '@annatarhe/lake-ui/button'
import Card from '@annatarhe/lake-ui/card'
import Skeleton from '@annatarhe/lake-ui/skeleton'
import { ArrowRight, ExternalLink, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { SUPPORT_EMAIL } from '@/constants/config'
import { cn } from '@/lib/utils'
import { withLink } from '@/lib/with-link'

/** The `auth` namespace's `t`, resolved by the server component above. */
export type AuthTranslate = (key: string) => string

function AuthCardFrame({
  t,
  children,
}: {
  t: AuthTranslate
  children: ReactNode
}) {
  return (
    <Card variant="elevated" padding="lg" className="w-full sm:p-9">
      <h2 className="type-title text-lake-fg">{t('card.title')}</h2>
      <p className="type-body text-lake-fg-muted mt-3">
        {t('card.description')}
      </p>
      {children}
    </Card>
  )
}

export function AuthCardLoading({ t }: { t: AuthTranslate }) {
  return (
    <AuthCardFrame t={t}>
      <div className="mt-8">
        <output className="sr-only">{t('card.loading')}</output>
        <div aria-hidden="true" className="flex flex-col gap-4">
          <Skeleton className="rounded-lake-control h-12 w-full" />
          <Skeleton shape="text" className="mx-auto w-48" />
          <div className="border-lake-line mt-4 border-t pt-6">
            <Skeleton shape="text" lines={3} />
          </div>
        </div>
      </div>
    </AuthCardFrame>
  )
}

/**
 * The `?error=` codes the Gate callback redirects with (see
 * src/app/api/auth/callback/route.ts). Anything unmapped falls back to
 * `errors.generic`, so a new code degrades into vague-but-true rather than
 * blank.
 */
const ERROR_CODES = new Set([
  'EMAIL_VERIFICATION_REQUIRED',
  'FORBIDDEN',
  'ACCOUNT_RECOVERY_REQUIRED',
  // The attempt was stale or replayed: the state entry had expired or was
  // bound to a different browser. Starting over is all this needs.
  'BAD_REQUEST',
  // Gate rejected the token exchange or the id token. Nothing the reader can
  // act on, and a retry often clears it.
  'LOGIN_FAILED',
  // Gate answered, but ClippingKK is not set up inside it -- a missing member
  // role, say. "Try again" would be a lie, so the copy does not say it.
  'GATE_NOT_CONFIGURED',
])

const linkClass =
  'rounded-sm font-medium text-lake-accent-text underline decoration-lake-accent-text/40 underline-offset-4 outline-none transition-colors duration-150 hover:decoration-current focus-visible:ring-2 focus-visible:ring-lake-ring'

export default function AuthCard({
  t,
  error,
  next,
  accountUrl,
}: {
  t: AuthTranslate
  error?: string
  next?: string
  accountUrl: string
}) {
  const message = error
    ? t(ERROR_CODES.has(error) ? `errors.${error}` : 'errors.generic')
    : null
  return (
    <AuthCardFrame t={t}>
      {message ? (
        <div
          role="alert"
          className="rounded-lake-control border-lake-warning/30 bg-lake-warning-soft text-lake-fg mt-6 flex items-start gap-3 border p-4 text-sm leading-relaxed"
        >
          <TriangleAlert
            aria-hidden="true"
            className="text-lake-warning mt-0.5 size-4 shrink-0"
          />
          <p>{message}</p>
        </div>
      ) : null}
      <a
        className={cn(
          buttonStyles({ variant: 'primary', size: 'lg' }),
          'mt-8 w-full'
        )}
        href={`/api/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
      >
        {t('card.continue')}
        <ArrowRight aria-hidden="true" className="size-4" />
      </a>
      <a
        className={cn(
          buttonStyles({ variant: 'ghost', size: 'md' }),
          'mt-3 w-full'
        )}
        href={accountUrl}
      >
        {t('card.manage')}
        <ExternalLink aria-hidden="true" className="size-3.5" />
      </a>
      <p className="border-lake-line text-lake-fg-muted mt-6 border-t pt-6 text-sm leading-relaxed">
        {withLink(t('card.legacy'), (label) => (
          <a className={linkClass} href={`mailto:${SUPPORT_EMAIL}`}>
            {label}
          </a>
        ))}
      </p>
    </AuthCardFrame>
  )
}
