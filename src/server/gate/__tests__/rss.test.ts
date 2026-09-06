// @vitest-environment node
import { expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({
  premium: false,
  limit: vi.fn(async () => []),
  legacyEnd: new Date('2099-01-01'),
}))
vi.mock('next/server', () => ({ connection: vi.fn() }))
vi.mock('../../env', () => ({
  getServerEnv: () => ({ APP_ORIGIN: 'https://example.com' }),
}))
vi.mock('../authz', () => ({
  entitlements: async () => ({ premium: state.premium }),
}))
vi.mock('../../db', () => ({
  getDatabase: () => ({
    db: {
      query: {
        users: {
          findFirst: async () => ({
            id: 1,
            name: 'Reader',
            bio: '',
            updatedAt: new Date(),
            premiumEndAt: state.legacyEnd,
          }),
        },
      },
      select: () => ({
        from: () => ({
          where: () => ({ orderBy: () => ({ limit: state.limit }) }),
        }),
      }),
    },
  }),
}))
import { GET } from '@/app/api/rss/user/[uid]/clippings/route'
it('uses Gate Premium for RSS limits, ignoring stale local accounting values', async () => {
  const context = { params: Promise.resolve({ uid: '1' }) }
  state.premium = false
  await GET(new Request('https://example.com/rss'), context)
  expect(state.limit).toHaveBeenLastCalledWith(30)
  state.legacyEnd = new Date(0)
  state.premium = true
  await GET(new Request('https://example.com/rss'), context)
  expect(state.limit).toHaveBeenLastCalledWith(100)
})
