
export enum UTPService {
  clipping = 'clipping',
  book = 'book'
}
export const KonzertThemeMap = {
  classic: {
    id: 0,
    name: '经典',
  },
  colorful: {
    id: 1,
    name: '彩色',
  },
  dark: {
    id: 2,
    name: '暗黑',
  },
  young: {
    id: 3,
    name: '青春',
  },
  light: {
    id: 4,
    name: '亮丽',
  }
}

export function getUTPLink(service: UTPService, params: Object): string {
  const d = new URLSearchParams(params as any)
  const distUrl = encodeURIComponent(`https://konzert.annatarhe.cn/${service.toString()}.html?${d.toString()}`)

  const screenWidth = process.browser ? (screen.width > 375 ? 375 : screen.width) : 375
  const dpi = 3

  return `https://utp.annatarhe.com/?url=${distUrl}&isMobile=true&isFullPage=true&viewPortWidth=${screenWidth}&width=${screenWidth * dpi}&deviceScaleFactor=${dpi}&viewPortHeight=768`
}
