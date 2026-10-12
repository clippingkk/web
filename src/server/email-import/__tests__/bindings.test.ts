// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'

import { PGlite } from '@electric-sql/pglite'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { rateLimit, sendEmailBindingCode } = vi.hoisted(() => ({
  rateLimit: vi.fn(async () => ({ allowed: true, count: 1 })),
  sendEmailBindingCode: vi.fn(async (_email: string, _code: string) => {}),
}))
vi.mock('../../db', () => ({ getDatabase: vi.fn() }))
vi.mock('../../redis', () => ({ rateLimit }))
vi.mock('../../integrations', () => ({ sendEmailBindingCode }))

import { getDatabase } from '../../db'
import * as schema from '../../db/schema'
import {
  findVerifiedBinding,
  listEmailBindings,
  MAX_EMAIL_BINDINGS,
  parseEmailAddress,
  removeEmailBinding,
  requestEmailBinding,
  verifyEmailBinding,
} from '../bindings'

const pg = new PGlite()
const db = drizzle(pg, { schema })

const READER = 1
const OTHER = 2

/** The code most recently mailed to `email`. */
function codeFor(email: string) {
  const call = sendEmailBindingCode.mock.calls.findLast(([to]) => to === email)
  if (!call) throw new Error(`no code sent to ${email}`)
  return call[1]
}

async function bind(userId: number, email: string) {
  const { id } = await requestEmailBinding(userId, email)
  return verifyEmailBinding(userId, id, codeFor(email))
}

beforeAll(async () => {
  for (const name of (await readdir('drizzle'))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    await pg.exec(await readFile(`drizzle/${name}`, 'utf8'))
}, 30000)

beforeEach(async () => {
  await pg.exec('TRUNCATE users, email_bindings RESTART IDENTITY')
  vi.mocked(getDatabase).mockReturnValue({ db } as never)
  rateLimit.mockResolvedValue({ allowed: true, count: 1 })
  sendEmailBindingCode.mockClear()
  await db.insert(schema.users).values([
    {
      id: READER,
      name: 'Reader',
      email: 'r@example.com',
      pwd: '',
      checked: true,
    },
    {
      id: OTHER,
      name: 'Other',
      email: 'o@example.com',
      pwd: '',
      checked: true,
    },
  ])
})

describe('email bindings', () => {
  it('binds an address once the mailed code is entered', async () => {
    const pending = await requestEmailBinding(READER, ' Kindle@Example.COM ')
    expect(pending).toMatchObject({
      email: 'kindle@example.com',
      verified: false,
    })
    expect(sendEmailBindingCode).toHaveBeenCalledWith(
      'kindle@example.com',
      expect.stringMatching(/^\d{6}$/)
    )
    expect(await findVerifiedBinding('kindle@example.com')).toBeNull()

    const code = codeFor('kindle@example.com')
    const wrong = code === '000000' ? '111111' : '000000'
    await expect(
      verifyEmailBinding(READER, pending.id, wrong)
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_CODE' })
    await expect(
      verifyEmailBinding(OTHER, pending.id, code)
    ).rejects.toMatchObject({ status: 404 })

    const verified = await verifyEmailBinding(READER, pending.id, code)
    expect(verified).toMatchObject({ id: pending.id, verified: true })
    expect(await listEmailBindings(READER)).toEqual([verified])
    expect(await findVerifiedBinding('KINDLE@example.com')).toEqual({
      id: pending.id,
      userId: READER,
    })
    await expect(
      requestEmailBinding(READER, 'kindle@example.com')
    ).rejects.toMatchObject({ status: 409, code: 'ALREADY_VERIFIED' })
  })

  it('replaces the code when a pending address is added again', async () => {
    const { id } = await requestEmailBinding(READER, 'kindle@example.com')
    const first = codeFor('kindle@example.com')
    let second = first
    while (second === first) {
      await requestEmailBinding(READER, 'kindle@example.com')
      second = codeFor('kindle@example.com')
    }

    await expect(verifyEmailBinding(READER, id, first)).rejects.toMatchObject({
      code: 'INVALID_CODE',
    })
    await expect(verifyEmailBinding(READER, id, second)).resolves.toMatchObject(
      { verified: true }
    )
    expect(await listEmailBindings(READER)).toHaveLength(1)
  })

  it(`caps a reader at ${MAX_EMAIL_BINDINGS} addresses`, async () => {
    for (let i = 0; i < MAX_EMAIL_BINDINGS; i++)
      await requestEmailBinding(READER, `reader${i}@example.com`)

    await expect(
      requestEmailBinding(READER, 'one-more@example.com')
    ).rejects.toMatchObject({ status: 409, code: 'TOO_MANY_EMAIL_BINDINGS' })
    // Re-sending to an address already on the list is not a new binding.
    await expect(
      requestEmailBinding(READER, 'reader0@example.com')
    ).resolves.toMatchObject({ verified: false })
    expect(
      await requestEmailBinding(OTHER, 'one-more@example.com')
    ).toBeTruthy()
  })

  it('gives a verified address to one reader only', async () => {
    await requestEmailBinding(OTHER, 'shared@example.com')
    const otherCode = codeFor('shared@example.com')
    const [otherRow] = await db
      .select()
      .from(schema.emailBindings)
      .where(eq(schema.emailBindings.userId, OTHER))
    await bind(READER, 'shared@example.com')

    await expect(
      requestEmailBinding(OTHER, 'shared@example.com')
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_ALREADY_BOUND' })
    // The other reader's earlier pending code lost the race.
    await expect(
      verifyEmailBinding(OTHER, otherRow.id, otherCode)
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_ALREADY_BOUND' })
    expect(await findVerifiedBinding('shared@example.com')).toMatchObject({
      userId: READER,
    })
  })

  it('refuses an expired code', async () => {
    const { id } = await requestEmailBinding(READER, 'kindle@example.com')
    await db
      .update(schema.emailBindings)
      .set({ codeExpiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.emailBindings.id, id))

    await expect(
      verifyEmailBinding(READER, id, codeFor('kindle@example.com'))
    ).rejects.toMatchObject({ status: 400, code: 'CODE_EXPIRED' })
  })

  it('locks the code after five wrong guesses', async () => {
    const { id } = await requestEmailBinding(READER, 'kindle@example.com')
    const code = codeFor('kindle@example.com')
    const wrong = code === '000000' ? '111111' : '000000'
    for (let i = 0; i < 5; i++)
      await expect(verifyEmailBinding(READER, id, wrong)).rejects.toMatchObject(
        { code: 'INVALID_CODE' }
      )

    await expect(verifyEmailBinding(READER, id, code)).rejects.toMatchObject({
      status: 429,
      code: 'TOO_MANY_ATTEMPTS',
    })
  })

  it('withdraws a code that could not be sent', async () => {
    sendEmailBindingCode.mockRejectedValueOnce(new Error('Resend is down'))
    await expect(
      requestEmailBinding(READER, 'kindle@example.com')
    ).rejects.toThrow('Resend is down')
    const lost = sendEmailBindingCode.mock.calls[0][1]
    const [row] = await db.select().from(schema.emailBindings)

    await expect(
      verifyEmailBinding(READER, row.id, lost)
    ).rejects.toMatchObject({ code: 'CODE_EXPIRED' })
    await requestEmailBinding(READER, 'kindle@example.com')
    await expect(
      verifyEmailBinding(READER, row.id, codeFor('kindle@example.com'))
    ).resolves.toMatchObject({ verified: true })
  })

  it('stops sending codes past the rate limit', async () => {
    rateLimit.mockResolvedValueOnce({ allowed: true, count: 1 })
    rateLimit.mockResolvedValueOnce({ allowed: false, count: 4 })

    await expect(
      requestEmailBinding(READER, 'kindle@example.com')
    ).rejects.toMatchObject({ status: 429, code: 'TOO_MANY_CODES' })
    expect(sendEmailBindingCode).not.toHaveBeenCalled()
    expect(rateLimit).toHaveBeenCalledWith('ck:email-binding:send:u:1', 5, 3600)
  })

  it('removes only the reader’s own address', async () => {
    const { id } = await bind(READER, 'kindle@example.com')

    await expect(removeEmailBinding(OTHER, id)).rejects.toMatchObject({
      status: 404,
    })
    await removeEmailBinding(READER, id)
    expect(await listEmailBindings(READER)).toEqual([])
    expect(await findVerifiedBinding('kindle@example.com')).toBeNull()
  })

  it('ignores bindings of deleted readers', async () => {
    await bind(READER, 'kindle@example.com')
    await db
      .update(schema.users)
      .set({ deletedAt: new Date() })
      .where(eq(schema.users.id, READER))

    expect(await findVerifiedBinding('kindle@example.com')).toBeNull()
  })
})

describe('parseEmailAddress', () => {
  it.each([
    ['Reader <Reader@iCloud.com>', 'reader@icloud.com'],
    ['"Smith, <J>" <j.smith@example.com>', 'j.smith@example.com'],
    ['plain@example.com', 'plain@example.com'],
    ['Nobody', null],
    ['', null],
  ])('%j → %j', (from, email) => {
    expect(parseEmailAddress(from)).toBe(email)
  })
})
