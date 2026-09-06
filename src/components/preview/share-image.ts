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

export async function capturePoster(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready
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
    const blob = await snapdom.toBlob(copy, {
      type: 'png',
      scale: 3,
      dpr: 1,
      embedFonts: false,
    })
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
