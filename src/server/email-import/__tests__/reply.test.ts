// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { redis } = vi.hoisted(() => ({ redis: new Map<string, unknown>() }))
vi.mock('../../redis', () => ({
  cacheGet: async (key: string) => redis.get(key),
  cacheSet: async (key: string, value: unknown) => {
    redis.set(key, value)
  },
  rateLimit: async (key: string, limit: number) => {
    const count = Number(redis.get(key) ?? 0) + 1
    redis.set(key, count)
    return { allowed: count <= limit, count }
  },
}))
vi.mock('../../integrations', () => ({ getResend: vi.fn() }))

import type { KindleNotebook } from '../kindle-notebook'
import { claimReplyQuota, notebookJson, REPLY_LIMITS } from '../reply'

const day = (date: string) => new Date(`${date}T12:00:00.000Z`)

beforeEach(() => redis.clear())

describe('claimReplyQuota', () => {
  it('allows a sender 30 replies a calendar month', async () => {
    let sent = 0
    // Five a day for six days uses up the month; the seventh day is refused.
    for (let date = 1; date <= 7; date++)
      for (let i = 0; i < REPLY_LIMITS.senderPerDay; i++) {
        const at = day(`2026-10-0${date}`)
        const quota = await claimReplyQuota(
          'reader@icloud.com',
          `oct-${date}-${i}`,
          at
        )
        if (quota === 'allowed') sent++
        else expect(quota).toBe('sender_month')
      }
    expect(sent).toBe(REPLY_LIMITS.senderPerMonth)

    await expect(
      claimReplyQuota('reader@icloud.com', 'nov-1', day('2026-11-01'))
    ).resolves.toBe('allowed')
  })

  it('starts a fresh daily allowance each UTC day', async () => {
    for (let i = 0; i < REPLY_LIMITS.senderPerDay; i++)
      await claimReplyQuota('reader@icloud.com', `a-${i}`, day('2026-10-12'))

    await expect(
      claimReplyQuota('reader@icloud.com', 'a-5', day('2026-10-12'))
    ).resolves.toBe('sender_day')
    // A sender over its own limit doesn't use up everyone else's allowance.
    expect(redis.get('ck:email-import:reply:all:2026-10-12')).toBe(
      REPLY_LIMITS.senderPerDay
    )
    await expect(
      claimReplyQuota('reader@icloud.com', 'b-0', day('2026-10-13'))
    ).resolves.toBe('allowed')
  })

  it(`stops every reply after ${REPLY_LIMITS.perDay} in a day`, async () => {
    const at = day('2026-10-12')
    for (let i = 0; i < REPLY_LIMITS.perDay; i++)
      await expect(
        claimReplyQuota(`sender-${i}@example.com`, `email-${i}`, at)
      ).resolves.toBe('allowed')

    await expect(
      claimReplyQuota('fresh@example.com', 'email-over', at)
    ).resolves.toBe('global')
  })

  it('does not count a retried email twice', async () => {
    const at = day('2026-10-12')
    for (let i = 0; i < 10; i++)
      await expect(
        claimReplyQuota('reader@icloud.com', 'same-email', at)
      ).resolves.toBe('allowed')
  })
})

describe('notebookJson', () => {
  it('flattens every book into one clipping list and one note list', () => {
    const books: KindleNotebook[] = [
      {
        title: 'Walden',
        authors: 'Henry David Thoreau',
        highlights: [
          { content: 'I went to the woods', pageAt: '#10' },
          { content: 'Simplify, simplify', pageAt: '12' },
        ],
        notes: [{ content: 'Why I keep reading', pageAt: '#11', highlight: 0 }],
      },
      {
        title: '经略幽燕：宋辽战争军事灾难的战略分析',
        authors: '曾瑞龙',
        highlights: [{ content: '北宋經略幽燕', pageAt: '#551' }],
        notes: [],
      },
    ]

    expect(notebookJson(books, Date.parse('2026-10-12T08:00:00.000Z'))).toEqual(
      {
        clippings: [
          {
            title: 'Walden',
            author: 'Henry David Thoreau',
            content: 'I went to the woods',
            pageAt: '#10',
            createdAt: '2026-10-12T08:00:00.000Z',
          },
          {
            title: 'Walden',
            author: 'Henry David Thoreau',
            content: 'Simplify, simplify',
            pageAt: '12',
            createdAt: '2026-10-12T08:00:00.001Z',
          },
          {
            title: '经略幽燕：宋辽战争军事灾难的战略分析',
            author: '曾瑞龙',
            content: '北宋經略幽燕',
            pageAt: '#551',
            createdAt: '2026-10-12T08:00:00.000Z',
          },
        ],
        notes: [
          {
            title: 'Walden',
            author: 'Henry David Thoreau',
            content: 'Why I keep reading',
            pageAt: '#11',
          },
        ],
      }
    )
  })
})
