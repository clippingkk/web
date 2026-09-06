import { beforeEach, describe, expect, it, vi } from 'vitest'

import { capturePoster, posterFilename, prepareImage } from './share-image'

const toBlob = vi.hoisted(() => vi.fn())
vi.mock('@zumer/snapdom', () => ({ snapdom: { toBlob } }))

beforeEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
  toBlob.mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
})

describe('poster export', () => {
  it('captures an unscaled copy as a PNG and cleans it up', async () => {
    const poster = document.createElement('div')
    poster.textContent = '完整内容\nAll paragraphs'
    const blob = await capturePoster(poster)
    expect(blob.type).toBe('image/png')
    const [copy, options] = toBlob.mock.calls[0]
    expect(copy).not.toBe(poster)
    expect(copy.textContent).toBe(poster.textContent)
    expect(options).toMatchObject({ type: 'png', scale: 3, dpr: 1 })
    expect(document.body.contains(copy)).toBe(false)
  })
  it('rejects oversized posters before capture', async () => {
    const poster = document.createElement('div')
    Object.defineProperty(poster, 'scrollHeight', { value: 6000 })
    await expect(capturePoster(poster)).rejects.toThrow('poster-too-large')
    expect(toBlob).not.toHaveBeenCalled()
  })
  it('rejects SVG output and removes the capture copy', async () => {
    toBlob.mockResolvedValue(new Blob(['svg'], { type: 'image/svg+xml' }))
    await expect(capturePoster(document.createElement('div'))).rejects.toThrow(
      'Invalid PNG'
    )
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull()
  })
  it('preserves PNG filenames and sanitizes filesystem separators', () => {
    expect(posterFilename('Book', 'Author', 12)).toBe(
      'clippingkk-Book-Author-12.png'
    )
    expect(posterFilename('A/B', '', 'share')).toBe('clippingkk-A-B--share.png')
  })
  it('fails on inaccessible or non-image original assets', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(
      prepareImage('https://example.com/image', new AbortController().signal)
    ).rejects.toThrow()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['html'], { type: 'text/html' }),
      })
    )
    await expect(
      prepareImage('https://example.com/image', new AbortController().signal)
    ).rejects.toThrow('Invalid image')
    vi.unstubAllGlobals()
  })
})
