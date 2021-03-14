
export enum UTPService {
  clipping = 'clipping',
  book = 'book'
}

export function getUTPLink(service: UTPService, params: Object): string {
  const d = new URLSearchParams(params as any)
  const distUrl = encodeURIComponent(`https://konzert.annatarhe.com/${service.toString()}.html?${d.toString()}`)

  const screenWidth = screen.width > 375 ? 375 : screen.width
  const dpi = 3

  return `https://utp.annatarhe.com/?url=${distUrl}&isMobile=true&isFullPage=true&viewPortWidth=${screenWidth}&width=${screenWidth * dpi}&deviceScaleFactor=${dpi}&viewPortHeight=768`
}
