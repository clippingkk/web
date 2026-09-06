import { and, eq, isNull, or } from 'drizzle-orm'

import { getDatabase } from '../db'
import { clippings, users } from '../db/schema'
import { ApiError, assertFound } from '../errors'
import { entitlements } from '../gate/authz'

export async function requirePremium(userId: number) {
  if (!userId)
    throw new ApiError('Sign in to use AI features.', 401, 'UNAUTHORIZED')
  const user = await getDatabase().db.query.users.findFirst({
    where: and(eq(users.id, userId), isNull(users.deletedAt)),
  })
  if (!user)
    throw new ApiError('Sign in to use AI features.', 401, 'UNAUTHORIZED')
  if ((await entitlements(userId)).premium !== true) {
    throw new ApiError(
      'An active Premium subscription is required. Visit Pricing to upgrade.',
      403,
      'PREMIUM_REQUIRED'
    )
  }
}

export async function aiClipping(id: number, userId: number) {
  return assertFound(
    await getDatabase().db.query.clippings.findFirst({
      where: and(
        eq(clippings.id, id),
        isNull(clippings.deletedAt),
        or(eq(clippings.visible, true), eq(clippings.createdBy, userId))
      ),
    }),
    'clipping not found'
  )
}
