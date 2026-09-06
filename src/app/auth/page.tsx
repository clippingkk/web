import { redirect } from 'next/navigation'

import { ApiError } from '@/server/errors'
import { gateConfig } from '@/server/gate/config'
import { currentSession } from '@/server/gate/current'
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const session = await currentSession().catch((error) => {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      params.error ??= error.code
      return null
    }
    throw error
  })
  if (session && !params.error) redirect(`/dash/${session.localUserId}/home`)
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold">Sign in to ClippingKK</h1>
      <p>
        Your Evonia Gate account connects you to ClippingKK. Your books and
        clippings stay here.
      </p>
      {params.error && (
        <p role="alert">
          {params.error === 'EMAIL_VERIFICATION_REQUIRED'
            ? 'Verify your email in Gate, then try again.'
            : params.error === 'FORBIDDEN'
              ? 'Your ClippingKK access has been removed. Contact support to restore access.'
              : params.error === 'ACCOUNT_RECOVERY_REQUIRED'
                ? 'We could not safely link your existing account. Contact support to recover your clippings.'
                : 'Sign-in could not be completed. Please try again.'}
        </p>
      )}
      <a
        className="rounded-xl bg-indigo-600 px-5 py-3 text-center text-white"
        href={`/api/auth/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ''}`}
      >
        Continue with Gate
      </a>
      <a href={`${gateConfig().baseUrl}/account`}>Manage your Gate account</a>
      <p className="text-sm">
        Previously used phone, WeChat, a wallet, or a different Apple email?{' '}
        <a href="mailto:iamhele1994@gmail.com">Contact support</a> to verify and
        recover your old account.
      </p>
    </main>
  )
}
