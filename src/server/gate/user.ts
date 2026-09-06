import { eq, sql } from 'drizzle-orm'

import { getDatabase } from '../db'
import { users } from '../db/schema'
import { ApiError } from '../errors'
import type { GateIdentity } from './verify'
export async function ensureLocalUser(identity: GateIdentity) {
  const email = identity.email.trim()
  if (!identity.emailVerified || !email || email.length > 255)
    throw new ApiError(
      'Verify your email in Gate, then sign in again.',
      403,
      'EMAIL_VERIFICATION_REQUIRED'
    )
  return getDatabase().db.transaction(async (tx) => {
    // Serialize normalized-email linking and subject creation, including absent rows.
    for (const lock of [
      `email:${email.toLowerCase()}`,
      `subject:${identity.gateUserId}`,
    ].sort())
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${lock}, 0))`
      )
    const [linked] = await tx
      .select()
      .from(users)
      .where(eq(users.gateUserId, identity.gateUserId))
    if (linked) {
      if (linked.deletedAt)
        throw new ApiError(
          'Account deletion is in progress. Contact support.',
          409,
          'ACCOUNT_RECOVERY_REQUIRED'
        )
      return linked
    }
    const matches = await tx
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = lower(${email})`)
    if (matches.length > 1 || matches.some((u) => u.deletedAt || u.gateUserId))
      throw new ApiError(
        'This account requires recovery. Contact support to verify your existing ClippingKK account.',
        409,
        'ACCOUNT_RECOVERY_REQUIRED'
      )
    if (matches[0]) {
      const [updated] = await tx
        .update(users)
        .set({ gateUserId: identity.gateUserId, updatedAt: new Date() })
        .where(eq(users.id, matches[0].id))
        .returning()
      return updated
    }
    const [created] = await tx
      .insert(users)
      .values({
        gateUserId: identity.gateUserId,
        email,
        name: (identity.name || email.split('@')[0]).slice(0, 255),
        avatar: (identity.image ?? '').slice(0, 1024),
        pwd: '',
        checked: true,
      })
      .returning()
    return created
  })
}

export async function provisionMember(userId: number) {
  const { gateRequest, projectPath } = await import('./client')
  await getDatabase().db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .for('update')
    if (!user || user.deletedAt || !user.gateUserId)
      throw new ApiError('Account unavailable', 401)
    if (user.gateProvisionedAt) return
    const roles = await gateRequest<{ id: string; slug: string }[]>(
      `${projectPath()}/roles`
    )
    const member = roles.find((r) => r.slug === 'clippingkk-member')
    if (!member)
      throw new ApiError(
        'ClippingKK member role is not configured in Gate',
        503
      )
    await gateRequest(`${projectPath()}/role-bindings`, {
      method: 'POST',
      body: JSON.stringify({
        roleId: member.id,
        principalType: 'user',
        principalId: user.gateUserId,
      }),
    })
    await tx
      .update(users)
      .set({ gateProvisionedAt: new Date() })
      .where(eq(users.id, user.id))
  })
}
