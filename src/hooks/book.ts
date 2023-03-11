import { WenquBook, WenquSearchResponse, wenquRequest } from "../services/wenqu"
import { useMemo } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"

// 3 days
export const duration3Days = 1000 * 60 * 60 * 24 * 3

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
  const chunkedDbIds = useMemo(() => {
    const result: string[][] = [[]]
    const validSet = doubanIds.filter(x => x.length > 3)

    const chunkSize = 50
    for (let i = 0; i < validSet.length; i += chunkSize) {
      result.push(validSet.slice(i, i + chunkSize));
    }
    return result
  }, [doubanIds])

  const bbs = useQueries({
    queries: chunkedDbIds.map(dbIds => ({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    enabled: dbIds.length > 0 && !skip,
    staleTime: duration3Days,
    cacheTime: duration3Days,
    }))
  })

  return {
    books: bbs.reduce((acc, bs) => {
      acc.push(...(bs.data?.books ?? []))
      return acc
    }, [] as WenquBook[]),
    loading: bbs.every(bs => bs.isLoading)
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

