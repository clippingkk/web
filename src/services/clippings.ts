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

export async function create(clippings: TClippingItem[]) {
  const response = await (request(`/clippings/multip/create`, {
    method: 'POST',
    body: JSON.stringify({ clippings })
  }) as Promise<IHttpClippingItem[]>)

  console.log(response)
  return response
}
