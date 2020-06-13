import { request } from "./ajax";
import { supportsWebp } from '../utils/image'
import { IClippingItem, IHttpClippingItem } from "./clippings";

interface Book {
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

export interface IHttpBook extends Book {
  pubdate: string
}

export interface IBook extends Book {
  pubdate: Date
}

let isSupportWebp: boolean

export function covertHttpBook2Book(book: IHttpBook): IBook {
  const isCDNImage = book.image.indexOf('http') !== 0
  const image = isCDNImage ? `https://cdn.annatarhe.com/${book.image}-copyrightDB${isSupportWebp ? '.webp' : ''}` : book.image
  console.log(isCDNImage, image, process.env.NODE_ENV)
  return {
    ...book,
    image: process.env.NODE_ENV === 'production' ? image : 'https://picsum.photos/400/500?random=' + Math.random(),
    pubdate: new Date(book.pubdate)
  } as IBook
}

export async function getBooks(userid: number, offset: number): Promise<IBook[]> {
  const response = await (request(`/clippings/books/${userid}?take=20&from=${offset}`) as Promise<IHttpBook[]>)
  isSupportWebp = await supportsWebp()
  return response.map(covertHttpBook2Book)
}

export async function searchBookDetail(doubanId: string): Promise<IBook> {
  const response = await (request(`/clippings/book/${doubanId}`) as Promise<IHttpBook>)
  isSupportWebp = await supportsWebp()
  return covertHttpBook2Book(response)
}

export async function getBookClippings(userid: number, bookId: string, offset: number): Promise<IClippingItem[]> {
  const response = await (request(`/book/clippings/${userid}/${bookId}?take=20&from=${offset}`) as Promise<IHttpClippingItem[]>)
  return response.map(item => ({ ...item, createdAt: new Date(item.createdAt) } as IClippingItem))
}

export async function updateClippingBook(clippingId: number, bookId: string) {
    return request(`/book/clippings/${clippingId}`, {
      method: 'PUT',
      body: JSON.stringify({ bookId })
    })
}
