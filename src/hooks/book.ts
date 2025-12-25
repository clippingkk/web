import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  type WenquBook,
  type WenquSearchResponse,
  wenquRequest,
} from '../services/wenqu'

// 3 days
export const duration3Days = 1000 * 60 * 60 * 24 * 3

type bookRequestReturn = {
  books: WenquBook[]
  loading: boolean
}

export function useSingleBook(
  doubanId?: string,
  skip?: boolean
): WenquBook | null {
  const bs = useQuery({
    queryKey: ['wenqu', 'books', 'dbId', doubanId],
    queryFn: () =>
      wenquRequest<WenquSearchResponse>(`/books/search?dbId=${doubanId}`),
    enabled: Boolean(doubanId && doubanId.length > 3) && !skip,
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
  const books = bs.data?.books
  if (!books || books.length === 0) {
    return null
  }
  return books[0]
}

export function useSingleBookSuspense(doubanId?: string): WenquBook | null {
  const bs = useSuspenseQuery({
    queryKey: ['wenqu', 'books', 'dbId', doubanId],
    queryFn: () =>
      wenquRequest<WenquSearchResponse>(`/books/search?dbId=${doubanId}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
  const books = bs.data.books
  if (books.length === 0) {
    return null
  }
  return books[0]
}

export function useMultipleBook(
  doubanIds: string[],
  skip?: boolean
): bookRequestReturn {
  const validDoubanIdList = useMemo(() => {
    return doubanIds
      .filter((x) => x.length > 3)
      .reduce<string[]>((acc, x) => {
        if (!acc.includes(x)) {
          acc.push(x)
        }
        return acc
      }, [])
  }, [doubanIds])
  const chunkedDbIds = useMemo(() => {
    const result: string[][] = []
    const chunkSize = 10
    for (let i = 0; i < validDoubanIdList.length; i += chunkSize) {
      result.push(validDoubanIdList.slice(i, i + chunkSize))
    }
    return result
  }, [validDoubanIdList])

  const bbs = useQueries({
    queries: chunkedDbIds.map((dbIds) => ({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(
          `/books/search?dbIds=${dbIds.join('&dbIds=')}`
        ),
      enabled: dbIds.length > 0 && !skip,
      staleTime: duration3Days,
      gcTime: duration3Days,
      cacheTime: duration3Days,
    })),
  })

  const isLoading = useMemo(() => bbs.every((bs) => bs.isLoading), [bbs.every])
  // reorder
  const bsList = bbs
    .filter((x) => x.data?.books)
    .flatMap((x) => x.data?.books) as WenquBook[]
  const books = validDoubanIdList.reduce<WenquBook[]>((acc, dbId) => {
    const tb = bsList.find((x) => x.doubanId.toString() === dbId)
    if (tb) {
      acc.push(tb)
    }
    return acc
  }, [])

  return {
    books,
    loading: isLoading,
  }
}

export function useBookSearch(query: string, offset: number, visible = true) {
  return useQuery({
    queryKey: ['wenqu', 'books', 'search', query, 50, offset],
    queryFn: (ctx) =>
      wenquRequest<WenquSearchResponse>(
        `/books/search?query=${query}&limit=50&offset=${offset}`,
        {
          signal: ctx.signal,
        }
      ),
    enabled: query.length > 1 && visible,
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
}
