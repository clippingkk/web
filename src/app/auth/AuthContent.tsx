import { redirect } from 'next/navigation'

import { ApiError } from '@/server/errors'
import { gateConfig } from '@/server/gate/config'
import { currentSession } from '@/server/gate/current'

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
  if (session && !authError) redirect(`/dash/${session.localUserId}/home`)
  return (
    <AuthCard
      error={authError}
      next={params.next}
      accountUrl={`${gateConfig().baseUrl}/account`}
    />
  )
}
