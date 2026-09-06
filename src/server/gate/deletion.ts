import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm'

import { getDatabase } from '../db'
import * as tables from '../db/schema'
import { ApiError } from '../errors'
import { gateRequest, projectPath } from './client'
export async function scheduleDeletion(userId: number) {
  await getDatabase().db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(tables.users)
      .where(eq(tables.users.id, userId))
      .for('update')
    if (!user) throw new ApiError('Account not found', 404)
    await tx
      .insert(tables.accountDeletions)
      .values({ userId, gateUserId: user.gateUserId })
      .onConflictDoNothing()
    await tx
      .update(tables.users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(tables.users.id, userId))
  })
  // Sessions consult the active local row on every request, so all sessions and legacy tokens stop now.
}
export async function processPendingDeletions() {
  return getDatabase().db.transaction(async (tx) => {
    const [job] = await tx
      .select()
      .from(tables.accountDeletions)
      .where(isNull(tables.accountDeletions.completedAt))
      .limit(1)
      .for('update', { skipLocked: true })
    if (!job) return
    await (await import('./session')).destroyUserSessions(job.userId)
    if (job.gateUserId)
      await gateRequest(
        `${projectPath()}/subjects/${encodeURIComponent(job.gateUserId)}/access`,
        { method: 'DELETE' }
      )
    const uid = job.userId
    const clips = tx
      .select({ id: tables.clippings.id })
      .from(tables.clippings)
      .where(eq(tables.clippings.createdBy, uid))
    const comments = tx
      .select({ id: tables.comments.id })
      .from(tables.comments)
      .where(
        or(
          eq(tables.comments.createdBy, uid),
          inArray(tables.comments.belongsTo, clips)
        )
      )
    await tx
      .delete(tables.collections)
      .where(
        or(
          eq(tables.collections.userId, uid),
          inArray(tables.collections.clipId, clips)
        )
      )
    await tx
      .delete(tables.reactions)
      .where(
        or(
          eq(tables.reactions.creator, uid),
          and(
            eq(tables.reactions.target, 0),
            inArray(tables.reactions.targetId, clips)
          ),
          and(
            eq(tables.reactions.target, 2),
            eq(tables.reactions.targetId, uid)
          )
        )
      )
    await tx
      .update(tables.comments)
      .set({ replyTo: -1 })
      .where(inArray(tables.comments.replyTo, comments))
    await tx
      .delete(tables.comments)
      .where(
        or(
          eq(tables.comments.createdBy, uid),
          inArray(tables.comments.belongsTo, clips)
        )
      )
    const hooks = tx
      .select({ id: tables.webHooks.id })
      .from(tables.webHooks)
      .where(eq(tables.webHooks.owner, uid))
    await tx
      .delete(tables.webHookRecords)
      .where(inArray(tables.webHookRecords.webHookRecords, hooks))
    await tx.delete(tables.webHooks).where(eq(tables.webHooks.owner, uid))
    const nouns = tx
      .select({ id: tables.nouns.id })
      .from(tables.nouns)
      .where(
        or(
          eq(tables.nouns.userNouns, uid),
          inArray(tables.nouns.clippingId, clips)
        )
      )
    await tx.execute(
      sql`update clippings set nouns = coalesce((select jsonb_agg(v) from jsonb_array_elements(nouns) v where (v::text)::bigint not in (${nouns})), '[]'::jsonb)`
    )
    await tx
      .delete(tables.nouns)
      .where(
        or(
          eq(tables.nouns.userNouns, uid),
          inArray(tables.nouns.clippingId, clips)
        )
      )
    await tx.delete(tables.clippings).where(eq(tables.clippings.createdBy, uid))
    await tx.delete(tables.devices).where(eq(tables.devices.userId, uid))
    await tx
      .delete(tables.externalAccounts)
      .where(eq(tables.externalAccounts.userId, uid))
    await tx
      .delete(tables.web3Addresses)
      .where(eq(tables.web3Addresses.userAddress, uid))
    await tx.delete(tables.nfts).where(eq(tables.nfts.owner, uid))
    await tx
      .delete(tables.userConnects)
      .where(
        or(
          eq(tables.userConnects.owner, uid),
          eq(tables.userConnects.target, uid)
        )
      )
    await tx
      .update(tables.orders)
      .set({ userOrders: null })
      .where(eq(tables.orders.userOrders, uid))
    await tx.delete(tables.users).where(eq(tables.users.id, uid))
    await tx
      .update(tables.accountDeletions)
      .set({ gateUserId: null, completedAt: new Date() })
      .where(eq(tables.accountDeletions.userId, uid))
  })
}
