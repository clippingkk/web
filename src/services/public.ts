import { request } from './ajax'
import { IHttpBook, covertHttpBook2Book } from './books'
import { UserContent } from '../store/user/type'

export type TopHttpResponse = {
  users: UserContent[]
  books: IHttpBook[],
}

export async function getTop() {
  const response = await request<TopHttpResponse>('/public/top')

  return {
    books: response.books.map(covertHttpBook2Book),
    users: response.users
  }
}
