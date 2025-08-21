import type { User } from '@/schema/generated'
import { request } from './ajax'
import { covertHttpBook2Book, type IHttpBook } from './books'

export type TopHttpResponse = {
  users: Pick<User, 'id' | 'name' | 'avatar'>[]
  books: IHttpBook[]
}

export async function getTop() {
  const response = await request<TopHttpResponse>('/public/top')

  return {
    books: response.books.map(covertHttpBook2Book),
    users: response.users,
  }
}
