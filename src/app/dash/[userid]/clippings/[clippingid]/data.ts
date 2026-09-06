import { cache } from 'react'

import {
  FetchClippingDocument,
  type FetchClippingQuery,
  type FetchClippingQueryVariables,
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'
import { duration3Days } from '@/hooks/book'
import { currentUserId } from '@/server/gate/current'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { getQueryGcTime } from '@/services/query-client'
import {
  type WenquBook,
  type WenquSearchResponse,
  wenquRequest,
} from '@/services/wenqu'

export const getClippingData = cache(async (clippingId: number) => {
  const uid = (await currentUserId())?.toString()
  const client = await getApolloServerClient()

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
      headers: {},
    },
  })

  let myProfile: ProfileQuery['me'] | undefined
  if (uid) {
    const p = await client.query<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      variables: {
        id: ~~uid,
      },
      context: {
        headers: {},
      },
    })
    myProfile = p.data!.me
  }

  let bookData: WenquBook | null = null
  const bookID = clippingsResponse.data!.clipping.bookID
  const rq = getReactQueryClient()
  if (bookID && bookID.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: getQueryGcTime(duration3Days),
    })
    bookData = bs.books.length === 1 ? bs.books[0] : null
  }

  return {
    clipping: clippingsResponse.data!.clipping,
    me: myProfile,
    bookData,
    uid: uid ? ~~uid : undefined,
  }
})
