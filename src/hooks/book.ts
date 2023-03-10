import { WenquBook, WenquSearchResponse, wenquRequest } from "../services/wenqu"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

// 3 days
const duration3Days = 1000 * 60 * 60 * 24 * 3

type bookRequestReturn = {
  books: WenquBook[]
  loading: boolean
}

export function useSingleBook(doubanId?: string, skip?: boolean): WenquBook | null {
  const bs = useQuery({
    queryKey: ['wenqu', 'books', 'dbId', doubanId],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${doubanId}`),
    enabled: Boolean(doubanId && doubanId.length > 3) && !skip,
    staleTime: duration3Days,
    cacheTime: duration3Days,
  })
  const books = bs.data?.books
  if (!books || books.length === 0) {
    return null
  }
  return books[0]
}

export function useMultipBook(doubanIds: string[], skip?: boolean): bookRequestReturn {
  const dbIds = useMemo(() => {
    return doubanIds.filter(x => x.length > 3)
  }, [doubanIds])

  const bs = useQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: (ctx) => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`, { signal: ctx.signal }),
    enabled: dbIds.length > 0 && !skip,
    staleTime: duration3Days,
    cacheTime: duration3Days,
  })

  return {
    books: bs.data?.books ?? [],
    loading: bs.isLoading
  }
}

export function useBookSearch(query: string, offset: number) {
  return useQuery({
    queryKey: ['wenqu', 'books', 'search', query, 50, offset],
    queryFn: (ctx) => wenquRequest<WenquSearchResponse>(`/books/search?query=${query}&limit=50&offset=${offset}`, {
      signal: ctx.signal
    }),
    enabled: query.length > 1,
    staleTime: duration3Days,
    cacheTime: duration3Days,
  })
}

