// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'

import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
const storage = vi.hoisted(async () => {
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')
  const schema = await import('../../db/schema')
  const pg = new PGlite()
  return { pg, db: drizzle(pg, { schema }) }
})
const gate = vi.hoisted(() => ({ grant: vi.fn() }))
vi.mock('../../db', () => ({ getDatabase: vi.fn() }))
vi.mock('../gate', () => ({ upsertAppleGrant: gate.grant }))
import { getDatabase } from '../../db'
import * as schema from '../../db/schema'
import { applyAppleUpdate, ownerOf } from '../apple/sync'
import type { AppleRenewalInfo, AppleTransaction } from '../apple/verify'
import {
  activeProvider,
  appleSubscriptionView,
  ensureAppAccountToken,
} from '../state'

const DAY = 86_400_000
const now = Date.now()
let reader: number
let other: number
let token: string

beforeAll(async () => {
  const { pg, db } = await storage
  for (const name of (await readdir('drizzle'))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    await pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
}, 30000)
beforeEach(async () => {
  const { pg, db } = await storage
  await pg.exec('TRUNCATE users, apple_subscriptions RESTART IDENTITY')
  gate.grant.mockReset()
  gate.grant.mockResolvedValue({})
  ;[{ id: reader }, { id: other }] = await db
    .insert(schema.users)
    .values([
      {
        name: 'Reader',
        email: 'reader@example.com',
        pwd: '',
        checked: true,
        gateUserId: 'gate-reader',
      },
      {
        name: 'Other',
        email: 'other@example.com',
        pwd: '',
        checked: true,
        gateUserId: 'gate-other',
      },
    ])
    .returning()
  token = await ensureAppAccountToken(reader)
})
afterAll(async () => (await storage).pg.close())

function transaction(
  overrides: Partial<AppleTransaction> = {}
): AppleTransaction {
  return {
    originalTransactionId: '1000',
    transactionId: '1000',
    productId: 'com.annatarhe.clippingkk.premium.monthly',
    environment: 'Sandbox',
    appAccountToken: token,
    expiresDate: now + 30 * DAY,
    signedDate: now,
    ...overrides,
  } as AppleTransaction
}
const rows = async () =>
  (await storage).db.select().from(schema.appleSubscriptions)
const lastGrant = () => gate.grant.mock.calls.at(-1)

it('records a purchase and grants Premium until it expires', async () => {
  await applyAppleUpdate(reader, { transaction: transaction() })
  expect(await rows()).toMatchObject([
    { originalTransactionId: '1000', userId: reader },
  ])
  expect(lastGrant()).toEqual(['gate-reader', new Date(now + 30 * DAY)])
})

it('hands out one token per reader and keeps it', async () => {
  expect(await ensureAppAccountToken(reader)).toBe(token)
  expect(await ensureAppAccountToken(other)).not.toBe(token)
})

it('refuses a purchase made for another account', async () => {
  await expect(
    applyAppleUpdate(other, { transaction: transaction() })
  ).rejects.toMatchObject({
    status: 409,
    code: 'APPLE_TRANSACTION_OTHER_ACCOUNT',
  })
  expect(await rows()).toHaveLength(0)
  expect(gate.grant).not.toHaveBeenCalled()
})

it('keeps a subscription with the reader who claimed it first', async () => {
  await applyAppleUpdate(reader, {
    transaction: transaction({ appAccountToken: undefined }),
  })
  await expect(
    applyAppleUpdate(other, {
      transaction: transaction({ appAccountToken: undefined }),
    })
  ).rejects.toMatchObject({ status: 409 })
})

it('extends with a renewal and ignores an older one arriving late', async () => {
  await applyAppleUpdate(reader, { transaction: transaction() })
  const renewal = transaction({
    transactionId: '1001',
    expiresDate: now + 60 * DAY,
    signedDate: now + 1,
  })
  await applyAppleUpdate(reader, { transaction: renewal })
  await applyAppleUpdate(reader, {
    transaction: transaction({ signedDate: now - 1 }),
  })
  expect(await rows()).toMatchObject([{ latestTransactionId: '1001' }])
  expect(lastGrant()).toEqual(['gate-reader', new Date(now + 60 * DAY)])
})

it('ends access on a refund of the current period and restores it on reversal', async () => {
  await applyAppleUpdate(reader, { transaction: transaction() })
  await applyAppleUpdate(reader, {
    transaction: transaction({ revocationDate: now + 1, signedDate: now + 1 }),
  })
  expect(lastGrant()).toEqual(['gate-reader', null])
  await applyAppleUpdate(reader, {
    transaction: transaction({ signedDate: now + 2 }),
  })
  expect(lastGrant()).toEqual(['gate-reader', new Date(now + 30 * DAY)])
})

it('never lets a refund of an earlier renewal cut the current period short', async () => {
  await applyAppleUpdate(reader, {
    transaction: transaction({
      transactionId: '1001',
      expiresDate: now + 60 * DAY,
    }),
  })
  await applyAppleUpdate(reader, {
    transaction: transaction({ revocationDate: now + 1, signedDate: now + 1 }),
  })
  expect(lastGrant()).toEqual(['gate-reader', new Date(now + 60 * DAY)])
})

it('ignores the transaction an upgrade replaced', async () => {
  await applyAppleUpdate(reader, { transaction: transaction() })
  await applyAppleUpdate(reader, {
    transaction: transaction({
      isUpgraded: true,
      revocationDate: now + 1,
      signedDate: now + 1,
    }),
  })
  expect(lastGrant()).toEqual(['gate-reader', new Date(now + 30 * DAY)])
})

it('keeps access through a billing grace period and shows a cancelled renewal', async () => {
  const lapsed = transaction({ expiresDate: now - DAY })
  const renewal = {
    originalTransactionId: '1000',
    autoRenewStatus: 0,
    gracePeriodExpiresDate: now + 5 * DAY,
    signedDate: now,
  } as AppleRenewalInfo
  await applyAppleUpdate(reader, { transaction: lapsed, renewal })
  expect(lastGrant()).toEqual(['gate-reader', new Date(now + 5 * DAY)])
  const [row] = await rows()
  expect(appleSubscriptionView(row)).toMatchObject({
    status: 'past_due',
    cancelAtPeriodEnd: true,
    provider: 'apple',
  })
  // An older renewal snapshot does not undo the newer one.
  await applyAppleUpdate(reader, {
    transaction: lapsed,
    renewal: {
      ...renewal,
      autoRenewStatus: 1,
      gracePeriodExpiresDate: undefined,
      signedDate: now - 1,
    },
  })
  expect(lastGrant()).toEqual(['gate-reader', new Date(now + 5 * DAY)])
})

it('stores nothing when Gate refuses the grant, so the app can retry', async () => {
  gate.grant.mockRejectedValue(new Error('Gate unavailable'))
  await expect(
    applyAppleUpdate(reader, { transaction: transaction() })
  ).rejects.toThrow()
  expect(await rows()).toHaveLength(0)
})

it('finds the reader of a notification by subscription, then by token', async () => {
  expect(await ownerOf(transaction())).toBe(reader)
  expect(await ownerOf(transaction({ appAccountToken: undefined }))).toBeNull()
  await applyAppleUpdate(reader, {
    transaction: transaction({ appAccountToken: undefined }),
  })
  expect(await ownerOf(transaction({ appAccountToken: undefined }))).toBe(
    reader
  )
})

it('does not find a deleted reader', async () => {
  const { db } = await storage
  await db
    .update(schema.users)
    .set({ deletedAt: new Date() })
    .where(eq(schema.users.id, reader))
  expect(await ownerOf(transaction())).toBeNull()
})

it('says the App Store bills a reader with a live Apple subscription', () => {
  const state = {
    premiumEndAt: null,
    appAccountToken: token,
    subscriptions: [
      {
        id: 's',
        status: 'canceled',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        provider: 'stripe' as const,
        productId: null,
      },
      {
        id: 'a',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        provider: 'apple' as const,
        productId: 'p',
      },
    ],
  }
  expect(activeProvider(state)).toBe('apple')
  expect(
    activeProvider({ ...state, subscriptions: [state.subscriptions[0]] })
  ).toBeNull()
})
