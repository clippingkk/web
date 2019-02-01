import { request, IBaseResponseData } from './ajax'

interface IBaseClippingItem {
    id: number
    title: string
    content: string
    pageAt: string
    createdBy: string
    bookId: string
    dataId: string
    seq: number
}

export interface IClippingItem extends IBaseClippingItem {
    createdAt: Date
}

interface IHttpClippingItem extends IBaseClippingItem {
    createdAt: number
}

export async function getClippings(userid: number, offset: number): Promise<IClippingItem[]> {
    const response = await (request(`/clippings/clippings/${userid}?take=20&from=${offset}`) as Promise<IHttpClippingItem[]>)
    console.log(response)
    const list = response.map(item => ({ ...item, createdAt: new Date(item.createdAt)} as IClippingItem))

    return list
}
