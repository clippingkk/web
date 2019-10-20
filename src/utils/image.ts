
let support: boolean

export enum ImageTheme {
  dark,
  light
}

export function supportsWebp(): Promise<boolean> {
  if (support !== undefined) {
    return Promise.resolve(support)
  }

  return new Promise(resolve => {
    const webp = new Image()

    webp.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
    // eslint-disable-next-line
    webp.onload = webp.onerror = () => {
      support = webp.height === 1
      return resolve(support)
    }
  })
}

// https://awik.io/determine-color-bright-dark-using-javascript/
// http://alienryderflex.com/hsp.html
export function getTheme(r: number, g: number, b: number): ImageTheme {
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  )

  return hsp > 127.5 ? ImageTheme.light : ImageTheme.dark
}
