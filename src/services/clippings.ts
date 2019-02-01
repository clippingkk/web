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

interface IHttpClippingsResponse {
    data: IHttpClippingItem[]
}

export async function getClippings(offset: number): Promise<IClippingItem[]> {
    const response = await (request(`/clippings?take=20`) as Promise<IHttpClippingsResponse>)
    const list = response.data.map(item => ({ ...item, createdAt: new Date(item.createdAt)} as IClippingItem))

    return list
}
