// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'

import { eq } from 'drizzle-orm'
import { beforeAll, beforeEach, afterAll, expect, it, vi } from 'vitest'
const storage = vi.hoisted(async () => {
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')
  const pg = new PGlite()
  return { pg, db: drizzle(pg) }
})
const upstream = vi.hoisted(() => ({ request: vi.fn(), destroy: vi.fn() }))
vi.mock('../../db', async () => ({ getDatabase: vi.fn() }))
vi.mock('../client', () => ({
  gateRequest: upstream.request,
  projectPath: () => '/projects/ck',
}))
vi.mock('../session', () => ({ destroyUserSessions: upstream.destroy }))
import { getDatabase } from '../../db'
import * as schema from '../../db/schema'
import { scheduleDeletion, processPendingDeletions } from '../deletion'
import { ensureLocalUser } from '../user'
const identity = {
  gateUserId: 'gate-person',
  email: 'person@example.com',
  name: 'Person',
  emailVerified: true,
}
beforeAll(async () => {
  const { pg, db } = await storage
  for (const name of (await readdir('drizzle'))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    await pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
}, 30000)
beforeEach(async () => {
  const { pg } = await storage
  await pg.exec(
    'TRUNCATE users, clippings, collections, comments, devices, external_accounts, nfts, nouns, orders, reactions, user_connects, web3_addresses, web_hooks, web_hook_records, account_deletions RESTART IDENTITY'
  )
  upstream.request.mockReset()
  upstream.request.mockResolvedValue({ removed: true })
  upstream.destroy.mockReset()
})
afterAll(async () => (await storage).pg.close())
it('preserves numeric IDs, profiles and clippings while linking case-insensitive verified email', async () => {
  const { db } = await storage
  const [original] = await db
    .insert(schema.users)
    .values({
      name: 'Local name',
      email: 'Person@Example.com',
      pwd: 'old',
      checked: true,
      bio: 'Local bio',
    })
    .returning()
  await db.insert(schema.clippings).values({
    title: 'Book',
    content: 'Saved',
    dataId: 'saved',
    createdBy: original.id,
  })
  const linked = await ensureLocalUser(identity)
  expect(linked).toMatchObject({
    id: original.id,
    name: 'Local name',
    bio: 'Local bio',
    gateUserId: identity.gateUserId,
  })
  expect(await db.select().from(schema.clippings)).toHaveLength(1)
  expect(
    (await ensureLocalUser({ ...identity, email: 'changed@example.com' })).id
  ).toBe(original.id)
})
it('rejects case-colliding emails and never transfers another subject binding', async () => {
  const { db } = await storage
  await db.insert(schema.users).values([
    { name: 'One', email: identity.email, pwd: '', checked: true },
    { name: 'Two', email: 'Person@Example.com', pwd: '', checked: true },
  ])
  await expect(ensureLocalUser(identity)).rejects.toMatchObject({
    code: 'ACCOUNT_RECOVERY_REQUIRED',
  })
  const rows = await db.select().from(schema.users)
  expect(rows.every((row) => row.gateUserId === null)).toBe(true)
  await db.delete(schema.users).where(eq(schema.users.id, rows[1].id))
  await db
    .update(schema.users)
    .set({ gateUserId: 'different' })
    .where(eq(schema.users.id, rows[0].id))
  await expect(ensureLocalUser(identity)).rejects.toMatchObject({
    code: 'ACCOUNT_RECOVERY_REQUIRED',
  })
})
it('durably disables access, retries upstream failure, removes dependent data and permits fresh registration', async () => {
  const { db } = await storage
  const user = await ensureLocalUser(identity)
  const [other] = await db
    .insert(schema.users)
    .values({
      name: 'Other',
      email: 'other@example.com',
      pwd: '',
      checked: true,
    })
    .returning()
  const [clip] = await db
    .insert(schema.clippings)
    .values({
      title: 'Private',
      content: 'Saved',
      dataId: 'owned',
      createdBy: user.id,
    })
    .returning()
  await db
    .insert(schema.collections)
    .values({ clipId: clip.id, userId: other.id })
  await db
    .insert(schema.comments)
    .values({ belongsTo: clip.id, createdBy: other.id, content: 'Comment' })
  await scheduleDeletion(user.id)
  expect(
    (
      await db.select().from(schema.users).where(eq(schema.users.id, user.id))
    )[0].deletedAt
  ).toBeInstanceOf(Date)
  await expect(ensureLocalUser(identity)).rejects.toMatchObject({
    code: 'ACCOUNT_RECOVERY_REQUIRED',
  })
  upstream.request.mockRejectedValueOnce(new Error('Gate unavailable'))
  await expect(processPendingDeletions()).rejects.toThrow('Gate unavailable')
  expect(await db.select().from(schema.clippings)).toHaveLength(1)
  await processPendingDeletions()
  expect(await db.select().from(schema.clippings)).toHaveLength(0)
  expect(await db.select().from(schema.collections)).toHaveLength(0)
  expect(await db.select().from(schema.comments)).toHaveLength(0)
  expect((await db.select().from(schema.users)).map((row) => row.id)).toEqual([
    other.id,
  ])
  expect(
    (await db.select().from(schema.accountDeletions))[0].completedAt
  ).toBeInstanceOf(Date)
  expect((await ensureLocalUser(identity)).id).not.toBe(user.id)
})

it('retries member provisioning after Gate accepted the binding but local work rolled back', async () => {
  const { provisionMember } = await import('../user')
  const user = await ensureLocalUser(identity)
  const bindings = new Set<string>()
  let first = true
  upstream.request.mockImplementation(
    async (path: string, options?: RequestInit) => {
      if (path.endsWith('/roles'))
        return [{ id: 'member', slug: 'clippingkk-member' }]
      bindings.add(String(options?.body))
      if (first) {
        first = false
        throw new Error('Response lost after Gate committed')
      }
      return { id: 'binding' }
    }
  )
  await expect(provisionMember(user.id)).rejects.toThrow('Response lost')
  const { db } = await storage
  expect((await db.select().from(schema.users))[0].gateProvisionedAt).toBeNull()
  await provisionMember(user.id)
  expect(bindings.size).toBe(1)
  expect(
    (await db.select().from(schema.users))[0].gateProvisionedAt
  ).toBeInstanceOf(Date)
  const calls = upstream.request.mock.calls.length
  await provisionMember(user.id)
  expect(upstream.request).toHaveBeenCalledTimes(calls)
})
