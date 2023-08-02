import profile from "../utils/profile"
import { API_HOST } from "../constants/config"

export type RGBColor = {
  r: number
  g: number
  b: number
}

export async function FetchQRCode(
  scene: string,
  page: string,
  width: number,
  isHyaline: boolean,
  color?: RGBColor
): Promise<HTMLImageElement> {

  const params = new URLSearchParams({
    scene: scene,
    page: page,
    width: width.toString(),
    isHyaline: isHyaline ? 'true' : 'false',
  })
  if (color) {
    params.set('color', `rgb(${color.r},${color.g},${color.b})`)
  }

  return fetch(
    `${API_HOST}/api/v1/mp/qrcode?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${profile.token}`,
    },
    credentials: 'include',
    mode: 'cors'
  })
    .then(res => res.blob())
    .then(res => {
      const img = new Image()
      img.src = URL.createObjectURL(res)
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img)
        img.onerror = err => reject(err)
      })
    })
}
