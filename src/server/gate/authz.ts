import { eq } from 'drizzle-orm'

import { getDatabase } from '../db'
import { users } from '../db/schema'
import { getServerEnv } from '../env'
import { ApiError } from '../errors'
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
/**
 * Gate stores no product roles (it removed /authorize and project role
 * bindings), so ClippingKK's administrators are the local user ids in
 * ROOT_USERS.
 */
export async function canAdmin(userId: number) {
  return getServerEnv().rootUsers.has(userId)
}
