import { WENQU_SIMPLE_TOKEN, WENQU_API_HOST } from "../constants/config"
import * as Sentry from '@sentry/react'

type WenquErrorResponse = {
  code: number
  error: string
}

export async function wenquRequest<T extends object>(url: string, options: RequestInit = {}): Promise<T> {
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
    Sentry.captureException(e)
    return Promise.reject(e)
  }
}


export interface WenquBookCoverImageInfo {
  id: number;
  blurHashValue: string;
  height: number;
  width: number;
  ratio: number;
  edges?: any;
}

export interface WenquBookEdge {
  imageInfo: WenquBookCoverImageInfo;
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
  edges?: WenquBookEdge
}

export interface WenquSearchResponse {
  count: number
  books: WenquBook[]
}
