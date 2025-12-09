// import ColorThief from 'colorthief'
let support: boolean

export enum ImageTheme {
  dark,
  light,
}

export function supportsWebp(): Promise<boolean> {
  if (support !== undefined) {
    return Promise.resolve(support)
  }

  return new Promise((resolve) => {
    const webp = new Image()

    webp.src =
      'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='

    webp.onload = webp.onerror = () => {
      support = webp.height === 1
      return resolve(support)
    }
  })
}

// export async function getImagePrimaryColor(imageUrl?: string): Promise<number[]> {
// if (!imageUrl) {
// return Promise.reject('image not found')
// }
// return new Promise((resolve, reject) => {
// const colorThief = new ColorThief()
// const img = new Image()
// img.crossOrigin = 'Anonymous'
// img.src = imageUrl
// img.addEventListener('load', function () {
// const c: number[] = colorThief.getColor(img)
// if (!c || c.length !== 3) {
// reject('color not found')
// }
// resolve(c)
// })
// img.addEventListener('error', reject)
// })

// }

// https://awik.io/determine-color-bright-dark-using-javascript/
// http://alienryderflex.com/hsp.html
export function getTheme(r: number, g: number, b: number): ImageTheme {
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  return hsp > 127.5 ? ImageTheme.light : ImageTheme.dark
}

export function rgbToHex(r: number, g: number, b: number) {
  return (
    `#${ 
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? `0${hex}` : hex
      })
      .join('')}`
  )
}

/**
 * usage:
 * lighten: shadeColor("#63C6FF",40)
 * darken: shadeColor("#63C6FF",-40)
 * @param color hex color
 * @param percent +- 10
 */
export function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16)
  let G = parseInt(color.substring(3, 5), 16)
  let B = parseInt(color.substring(5, 7), 16)

  R = ~~((R * (100 + percent)) / 100)
  G = ~~((G * (100 + percent)) / 100)
  B = ~~((B * (100 + percent)) / 100)
  R = R < 255 ? R : 255
  G = G < 255 ? G : 255
  B = B < 255 ? B : 255

  const RR = R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16)
  const GG = G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16)
  const BB = B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16)
  return `#${RR}${GG}${BB}`
}

export function invertColor(hex: string) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.')
  }
  // invert color components
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
  // pad each with zeros and return
  return `#${padZero(r)}${padZero(g)}${padZero(b)}`
}

export function hexToRGB(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return []
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ]
}

function padZero(str: string, len: number = 2) {
  const zeros = new Array(len).join('0')
  return (zeros + str).slice(-len)
}
