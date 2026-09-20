/** Prepare the exact original bytes for both the visible poster and capture. */
export async function prepareImage(
  url: string,
  signal: AbortSignal,
  retry = false
): Promise<string> {
  const response = await fetch(url, {
    signal,
    mode: 'cors',
    cache: retry ? 'reload' : 'default',
  })
  if (!response.ok) throw new Error('Image request failed')
  const blob = await response.blob()
  if (!blob.type.startsWith('image/')) throw new Error('Invalid image response')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Image could not be read'))
    reader.readAsDataURL(blob)
  })
}

export async function decodeImages(element: HTMLElement) {
  await Promise.all(
    Array.from(element.querySelectorAll('img')).map((image) => image.decode())
  )
}

/**
 * Request each run of text in the font it is actually set in, so the browser
 * fetches only the unicode-range subsets the poster needs. Only the leading
 * family is requested: load() would otherwise fetch every family in the stack
 * that covers the text. A failed face degrades to the serif fallback instead
 * of blocking the save.
 */
export async function loadPosterFonts(element: HTMLElement) {
  const runs = new Map<string, string>()
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.trim()
    if (!text || !node.parentElement) continue
    const style = getComputedStyle(node.parentElement)
    const family = style.fontFamily.split(',')[0].trim() || 'serif'
    const font = `${style.fontStyle || 'normal'} ${style.fontWeight || 400} 16px ${family}`
    runs.set(font, (runs.get(font) ?? '') + text)
  }
  await Promise.allSettled(
    Array.from(runs, ([font, text]) => document.fonts?.load?.(font, text))
  )
  await document.fonts?.ready
}

/**
 * A browser paints an SVG snapshot before it has decoded the fonts inlined in
 * it, so the first raster falls back to system fonts. Paint throwaway frames
 * until two in a row match; the decoded fonts stay cached for the real export.
 */
async function settleSnapshotFonts(url: string) {
  let previous = ''
  for (let attempt = 0; attempt < 6; attempt++) {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(image, 0, 0)
    const frame = canvas.toDataURL()
    if (frame === previous) return
    previous = frame
    await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)))
  }
}

export async function capturePoster(element: HTMLElement): Promise<Blob> {
  await loadPosterFonts(element)
  await decodeImages(element)
  const height = element.scrollHeight
  // Conservative mobile canvas budget; never silently crop a long quote.
  if (height * 3 > 16384 || 1125 * height * 3 > 16_000_000) {
    throw new Error('poster-too-large')
  }
  const { snapdom } = await import('@zumer/snapdom')
  // A narrow-screen preview has a scaled ancestor. Capture an identical,
  // unscaled copy so viewport width never changes the exported dimensions.
  const holder = document.createElement('div')
  holder.setAttribute('aria-hidden', 'true')
  holder.style.cssText =
    'position:fixed;left:-10000px;top:0;width:375px;pointer-events:none'
  const copy = element.cloneNode(true) as HTMLElement
  holder.append(copy)
  document.body.append(holder)
  try {
    await decodeImages(copy)
    const snapshot = await snapdom(copy, {
      scale: 3,
      dpr: 1,
      // The SVG snapshot cannot fetch web fonts, so the used subsets are inlined.
      embedFonts: true,
    })
    // Best effort: an undecodable warm-up frame must not block the export.
    await settleSnapshotFonts(snapshot.url).catch(() => {})
    const blob = await snapshot.toBlob({ type: 'png' })
    if (!blob.size || blob.type !== 'image/png')
      throw new Error('Invalid PNG output')
    return blob
  } finally {
    holder.remove()
  }
}

export function posterFilename(
  title: string,
  author: string,
  suffix: string | number
) {
  return Array.from(`clippingkk-${title}-${author}-${suffix}.png`)
    .map((character) => (character.charCodeAt(0) < 32 ? '-' : character))
    .join('')
    .replace(/[<>:"/\\|?*]/g, '-')
}
