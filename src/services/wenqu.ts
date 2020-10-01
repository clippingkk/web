import { WENQU_SIMPLE_TOKEN, WENQU_API_HOST } from "../constants/config"
import swal from 'sweetalert'

type WenquErrorResponse = {
  code: number
  error: string
}

export async function wenquRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  options.headers = {
    ...(options.headers || {}),
    'X-Simple-Check': WENQU_SIMPLE_TOKEN
  }
  options.credentials = 'include'
  options.mode = 'cors'

  try {
    const response: T | WenquErrorResponse = await fetch(WENQU_API_HOST + url, options).then(res => res.json())
    if ('error' in response) {
      throw new Error(response.error)
    }
    return response
  } catch (e) {
    swal({
      title: 'Oops',
      text: e.toString(),
      icon: 'info'
    })
    return Promise.reject(e)
  }
}

export interface WenquBook {
  id: number
  rating: number
  author: string
  pubdate: string
  totalPages: number
  originTitle: string
  image: string
  doubanId: number
  title: string
  url: string
  press: string
  isbn: string
  tags: string[]
  authorIntro: string
  summary: string
  createdAt: string
  updatedAt: string
}

export interface WenquSearchResponse {
  count: number
  books: WenquBook[]
}
