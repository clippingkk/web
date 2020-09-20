import profile from "../utils/profile"
import { API_HOST } from "../constants/config"

export async function FetchQRCode(scene: string, page: string, width: number, isHyaline: boolean): Promise<HTMLImageElement> {
  return fetch(
    `${API_HOST}/api/v1/mp/qrcode?scene=${encodeURIComponent(scene)}&page=${page}&width=${width}&isHyaline=${isHyaline}`, {
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
