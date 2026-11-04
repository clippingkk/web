import { describe, expect, it } from 'vitest'

import { RSS_FEED_LIMIT } from '@/server/rss/limits'

import en from '../../locales/en/pricing.json'
import ko from '../../locales/ko/pricing.json'
import zh from '../../locales/zhCN/pricing.json'
import { FREE_FEATURES, PREMIUM_FEATURES } from './features'

const locales = { en, zhCN: zh, ko }

describe('pricing copy', () => {
  it('only advertises features the cards render', () => {
    const rendered = new Set<string>([...FREE_FEATURES, ...PREMIUM_FEATURES])
    for (const [lng, messages] of Object.entries(locales)) {
      expect(Object.keys(messages.features).sort(), lng).toEqual(
        ['label', ...rendered].sort()
      )
    }
  })

  it('gives everyone unlimited highlights and a short RSS feed', () => {
    expect(FREE_FEATURES).toContain('highlights')
    expect(FREE_FEATURES).toContain('rss')
    expect(FREE_FEATURES).not.toContain('ai')
    expect(en.features.highlights).toMatch(/unlimited/i)
    expect(en.features.rss).toContain(String(RSS_FEED_LIMIT.free))
    expect(zh.features.rss).toContain(String(RSS_FEED_LIMIT.free))
    expect(ko.features.rss).toContain(String(RSS_FEED_LIMIT.free))
  })

  it('keeps AI, webhooks and the longer RSS feed on Premium', () => {
    expect(PREMIUM_FEATURES).toEqual(
      expect.arrayContaining(['ai', 'webhooks', 'rssExtended', 'mcp'])
    )
    expect(en.features.rssExtended).toContain(String(RSS_FEED_LIMIT.premium))
    expect(zh.features.rssExtended).toContain(String(RSS_FEED_LIMIT.premium))
    expect(ko.features.rssExtended).toContain(String(RSS_FEED_LIMIT.premium))
    expect(en.features.ai).not.toMatch(/\d/)
  })

  it('does not advertise a highlight cap, a free AI quota, or Premium-only uploads', () => {
    const blob = JSON.stringify(locales)
    expect(blob).not.toMatch(/2[,.]?000/)
    expect(blob).not.toMatch(/1[,.]?000/)
    expect(blob).not.toMatch(/GitHub Actions|命令行|명령줄/)
    expect(blob).not.toMatch(/first 10|前 10|처음 10/)
  })
})
