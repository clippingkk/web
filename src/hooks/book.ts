import { WenquBook, WenquSearchResponse, wenquRequest } from "../services/wenqu"
import useSWR from "swr"

export function useSingleBook(doubanId: string): WenquBook | null {
  const { data: booksResponse } = useSWR<WenquSearchResponse>(`/books/search?dbId=${doubanId}`, {
    fetcher: wenquRequest
  })

  if (!booksResponse || booksResponse.count !== 1) {
    return null
  }

  return booksResponse.books[0]
}
