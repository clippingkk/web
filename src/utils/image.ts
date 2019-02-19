
let support: boolean

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
