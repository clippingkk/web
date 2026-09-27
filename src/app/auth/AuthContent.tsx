import type { Route } from 'next'
import { redirect } from 'next/navigation'

import { ApiError } from '@/server/errors'
import { gateConfig } from '@/server/gate/config'
import { currentSession } from '@/server/gate/current'
import { safeNext } from '@/server/gate/security'

import AuthCard from './AuthCard'

export type AuthPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>
}

export default async function AuthContent({ searchParams }: AuthPageProps) {
  const params = await searchParams
  let authError = params.error
  const session = await currentSession().catch((error) => {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      authError ??= error.code
      return null
    }
    throw error
  })
  // Already signed in: go where the link wanted to take them, which is how a
  // page that bounced a signed-out reader here gets them back after sign-in in
  // another tab. safeNext() refuses foreign origins and /auth itself.
  if (session && !authError)
    redirect(
      (safeNext(params.next ?? null) ??
        `/dash/${session.localUserId}/home`) as Route
    )
  return (
    <AuthCard
      error={authError}
      next={params.next}
      accountUrl={`${gateConfig().baseUrl}/account`}
    />
  )
}
