import { eq } from 'drizzle-orm'

import type {
  AuthorizeResponse,
  GetSubjectEntitlementsResponse,
  GetSubjectBillingResponse,
} from '@/gate/generated/types.gen'

import { getDatabase } from '../db'
import { users } from '../db/schema'
import { getServerEnv } from '../env'
import { ApiError } from '../errors'
import { gateRequest, projectPath } from './client'
import { gateConfig } from './config'
export type Entitlements = Record<string, boolean | string | number>
export async function subjectForUser(userId: number) {
  const user = await getDatabase().db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user || user.deletedAt)
    throw new ApiError('Sign in again', 401, 'UNAUTHORIZED')
  return user.gateUserId
}
export async function requireSubject(userId: number) {
  const subject = await subjectForUser(userId)
  if (!subject)
    throw new ApiError(
      'Sign in through Gate on the web to link your account before purchasing.',
      409,
      'GATE_LINK_REQUIRED'
    )
  return subject
}
export async function entitlements(userId: number): Promise<Entitlements> {
  const subject = await subjectForUser(userId)
  if (!subject) return {}
  const response = await gateRequest<GetSubjectEntitlementsResponse['data']>(
    `${projectPath()}/subjects/${encodeURIComponent(subject)}/entitlements?environmentId=${gateConfig().environmentId}`
  )
  return response.entitlements
}
export async function canAdmin(userId: number) {
  const subject = await subjectForUser(userId)
  if (!subject)
    return (
      getServerEnv().LEGACY_AUTH_ENABLED === '1' &&
      getServerEnv().rootUsers.has(userId)
    )
  const result = await gateRequest<AuthorizeResponse['data']>('/authorize', {
    method: 'POST',
    body: JSON.stringify({
      projectId: gateConfig().projectId,
      principalType: 'user',
      principalId: subject,
      permission: 'clippingkk:admin',
    }),
  })
  return result.allowed
}
export async function premiumEndAt(userId: number) {
  const subject = await subjectForUser(userId)
  if (!subject) return ''
  const state = await gateRequest<GetSubjectBillingResponse['data']>(
    `${projectPath()}/subjects/${encodeURIComponent(subject)}/billing?environmentId=${encodeURIComponent(gateConfig().environmentId)}`
  )
  return state.premiumEndAt ?? ''
}

export async function requireProductRead(userId: number) {
  return requireProductPermission(userId, 'profile:read')
}
export async function requireProductWrite(userId: number) {
  return requireProductPermission(userId, 'clippingkk:write')
}
async function requireProductPermission(userId: number, permission: string) {
  const subject = await subjectForUser(userId)
  if (!subject) return
  const result = await gateRequest<AuthorizeResponse['data']>('/authorize', {
    method: 'POST',
    body: JSON.stringify({
      projectId: gateConfig().projectId,
      principalType: 'user',
      principalId: subject,
      permission,
    }),
  })
  if (!result.allowed)
    throw new ApiError('Product access denied', 403, 'FORBIDDEN')
}
