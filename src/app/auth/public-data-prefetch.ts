import { dehydrate, type DehydratedState } from '@tanstack/react-query'

import { PublicDataDocument, type PublicDataQuery } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { isValidDoubanId, wenquBooksByIdsQueryOptions } from '@/services/wenqu'

export type PublicDataWithBooks = {
  publicData?: PublicDataQuery
  dehydratedState: DehydratedState
}

export async function fetchPublicDataWithBooks(): Promise<PublicDataWithBooks> {
  const client = getApolloServerClient()
  const data = await client.query<PublicDataQuery>({
    query: PublicDataDocument,
    variables: {
      limit: 50,
    },
    fetchPolicy: 'network-only',
  })

  const dbIds =
    data.data?.public.books.map((x) => x.doubanId).filter(isValidDoubanId) ?? []

  const rq = getReactQueryClient()
  await rq.prefetchQuery(wenquBooksByIdsQueryOptions(dbIds))

  return {
    publicData: data.data,
    dehydratedState: dehydrate(rq),
  }
}
