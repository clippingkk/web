import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { duration3Days } from '@/hooks/book'
import {
  FetchClippingDocument,
  FetchClippingQuery,
  FetchClippingQueryVariables,
  ProfileDocument,
  ProfileQuery,
  ProfileQueryVariables,
} from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { WenquBook, wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const getClippingData = cache(async (clippingId: number) => {
  const cs = await cookies()
  const token = cs.get(COOKIE_TOKEN_KEY)?.value
  const uid = cs.get(USER_ID_KEY)?.value
  const client = getApolloServerClient()
  
  const clippingsResponse = await client.query<
    FetchClippingQuery,
    FetchClippingQueryVariables
  >({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: clippingId,
    },
    context: {
      headers: token
        ? {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
        : undefined,
    },
  })

  let myProfile: ProfileQuery['me'] | undefined = undefined
  if (uid) {
    const p = await client.query<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      variables: {
        id: ~~uid,
      },
      context: {
        headers: token
          ? {
            Authorization: 'Bearer ' + token,
          }
          : undefined,
      },
    })
    myProfile = p.data.me
  }

  let bookData: WenquBook | null = null
  const bookID = clippingsResponse.data.clipping.bookID
  const rq = getReactQueryClient()
  if (bookID && bookID.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    bookData = bs.books.length === 1 ? bs.books[0] : null
  }

  return {
    clipping: clippingsResponse.data.clipping,
    me: myProfile,
    bookData,
    uid: uid ? ~~uid : undefined,
  }
})