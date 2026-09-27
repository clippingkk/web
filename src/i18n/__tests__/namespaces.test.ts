import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { NAMESPACES } from '../namespaces'

const localesDir = join(__dirname, '..', '..', 'locales')

function keysOf(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix ? `${prefix}.${key}` : key)
  )
}

/** Plural forms differ per language (en has _one, zh/ko only _other). */
function withoutPlurals(keys: string[]) {
  return new Set(
    keys.map((key) => key.replace(/_(one|other|zero|few|many|two)$/, ''))
  )
}

describe('locale namespaces', () => {
  it.each(['en', 'zhCN', 'ko'])('lists every namespace file for %s', (lng) => {
    const files = readdirSync(join(localesDir, lng))
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace(/\.json$/, ''))
      .sort()
    expect([...NAMESPACES].sort()).toEqual(files)
  })

  it.each(NAMESPACES)('has the same keys in every language: %s', async (ns) => {
    const [en, zh, ko] = await Promise.all(
      ['en', 'zhCN', 'ko'].map(
        (lng) => import(`../../locales/${lng}/${ns}.json`)
      )
    )
    const expected = withoutPlurals(keysOf(en.default))
    expect(withoutPlurals(keysOf(zh.default))).toEqual(expected)
    expect(withoutPlurals(keysOf(ko.default))).toEqual(expected)
  })
})
