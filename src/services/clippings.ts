import { request, IBaseResponseData } from './ajax'
import { TClippingItem } from '../store/clippings/creator';

interface IBaseClippingItem {
  id: number
  title: string
  content: string
  pageAt: string
  createdBy: string
  bookId: string
  dataId: string
  seq: number
  updatedAt: string
}

interface TBaseBook {
  id: number
  rating: number
  author: string
  originTitle: string
  image: string
  doubanId: string
  title: string
  url: string
  authorIntro: string
  summary: string
}

interface TServerBook extends TBaseBook {
  pubDate: string
}

export interface TBook extends TBaseBook {
  pubDate: Date
}

export interface IClippingItem extends IBaseClippingItem {
  createdAt: Date
}

interface IHttpClippingItem extends IBaseClippingItem {
  createdAt: number
}

export async function getClippings(userid: number, offset: number): Promise<IClippingItem[]> {
  const response = await (request(`/clippings/clippings/${userid}?take=20&from=${offset}`) as Promise<IHttpClippingItem[]>)
  const list = response.map(item => ({ ...item, createdAt: new Date(item.createdAt) } as IClippingItem))

  return list
}

export async function getClipping(clippingid: number): Promise<IClippingItem> {
  const response = await (request(`/clippings/${clippingid}`) as Promise<IHttpClippingItem>)
  console.log(response)

  return {
    ...response,
    createdAt: new Date(response.createdAt)
  }
}

export async function create(clippings: TClippingItem[]) {
  const response = await (request(`/clippings/multip/create`, {
    method: 'POST',
    body: JSON.stringify({ clippings })
  }) as Promise<IHttpClippingItem[]>)

  return response
}

export async function searchBookDetail(title: string): Promise<TBook> {
  const response = await (request(`/clippings/book/${title}`) as Promise<TServerBook>)
  return {
    ...response,
    pubDate: new Date(response.pubDate)
  }
}
