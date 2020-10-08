import { WenquBook, WenquSearchResponse, wenquRequest } from "../services/wenqu"
import useSWR from "swr"

export function useSingleBook(doubanId?: string): WenquBook | null {
  const { data: booksResponse } = useSWR<WenquSearchResponse>(() => doubanId && doubanId.length > 5 ? `/books/search?dbId=${doubanId}` : '', {
    fetcher: wenquRequest,
    refreshInterval: undefined,
  })

  if (!booksResponse || booksResponse.count !== 1) {
    return null
  }

  return booksResponse.books[0]
}
export function useMultipBook(doubanIds: string[]): WenquBook[] {
  const query = doubanIds.join('&dbIds=').slice(1)

  const { data: booksResponse } = useSWR<WenquSearchResponse>(() => doubanIds.length > 0 ? `/books/search?dbIds=${query}` : '', {
    fetcher: wenquRequest,
    refreshInterval: undefined,
  })
  if (!booksResponse) {
    return []
  }

  return booksResponse.books
}

