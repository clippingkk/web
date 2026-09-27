import { afterEach, describe, expect, it, vi } from 'vitest'

import { STORAGE_LANG_KEY } from '@/constants/storage'

import { getLanguage } from '../language'

const i18n = vi.hoisted(() => ({ language: undefined as string | undefined }))

vi.mock('i18next', () => ({ default: i18n }))

describe('getLanguage', () => {
  afterEach(() => {
    i18n.language = undefined
    document.cookie = `${STORAGE_LANG_KEY}=; max-age=0; path=/`
  })

  it('prefers the language i18next has settled on', () => {
    i18n.language = 'ko'
    document.cookie = `${STORAGE_LANG_KEY}=zhCN; path=/`
    expect(getLanguage()).toBe('ko')
  })

  it('falls back to the language cookie', () => {
    document.cookie = `${STORAGE_LANG_KEY}=zhCN; path=/`
    expect(getLanguage()).toBe('zhCN')
  })

  it('defaults to English', () => {
    expect(getLanguage()).toBe('en')
  })
})
