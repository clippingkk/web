// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({
  linked: [] as unknown[],
  matches: [] as unknown[],
  writes: vi.fn(),
  execute: vi.fn(),
}))
vi.mock('../../db', () => ({
  getDatabase: () => ({
    db: {
      transaction: async (fn: (tx: unknown) => unknown) => {
        let select = 0
        return fn({
          execute: state.execute,
          select: () => ({
            from: () => ({
              where: async () =>
                select++ === 0 ? state.linked : state.matches,
            }),
          }),
          update: () => ({
            set: (value: unknown) => {
              state.writes(value)
              return { where: () => ({ returning: async () => [{ id: 42 }] }) }
            },
          }),
          insert: () => ({
            values: (value: unknown) => {
              state.writes(value)
              return { returning: async () => [{ id: 43 }] }
            },
          }),
        })
      },
    },
  }),
}))
import { ensureLocalUser } from '../user'
const identity = {
  gateUserId: 'gate',
  email: 'Person@Example.com',
  emailVerified: true,
  name: 'Person',
}
beforeEach(() => {
  state.linked = []
  state.matches = []
  state.writes.mockClear()
  state.execute.mockClear()
})
it('links an existing verified email match without replacing local identity or profile', async () => {
  state.matches = [{ id: 42, gateUserId: null, deletedAt: null }]
  expect((await ensureLocalUser(identity)).id).toBe(42)
  expect(state.writes).toHaveBeenCalledWith({
    gateUserId: 'gate',
    updatedAt: expect.any(Date),
  })
  expect(state.execute).toHaveBeenCalledTimes(2)
})
it('rejects unverified email before reading or changing account data', async () => {
  await expect(
    ensureLocalUser({ ...identity, emailVerified: false })
  ).rejects.toMatchObject({ code: 'EMAIL_VERIFICATION_REQUIRED' })
  expect(state.execute).not.toHaveBeenCalled()
})
it.each([
  [{ id: 1 }, { id: 2 }],
  [{ id: 1, gateUserId: 'other' }],
  [{ id: 1, deletedAt: new Date() }],
])('rejects ambiguous, already-bound or deleted matches', async (...rows) => {
  state.matches = rows
  await expect(ensureLocalUser(identity)).rejects.toMatchObject({
    code: 'ACCOUNT_RECOVERY_REQUIRED',
  })
  expect(state.writes).not.toHaveBeenCalled()
})
it('keeps the subject binding after a verified email change', async () => {
  state.linked = [{ id: 42, email: 'old@example.com', deletedAt: null }]
  expect((await ensureLocalUser(identity)).id).toBe(42)
  expect(state.writes).not.toHaveBeenCalled()
})
