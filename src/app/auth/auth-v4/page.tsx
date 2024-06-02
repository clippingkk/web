import React from 'react'
import AuthV4Content from './content'
import { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { duration3Days } from '../../../hooks/book'
import { PublicDataQuery, PublicDataDocument } from '../../../schema/generated'
import { getReactQueryClient } from '../../../services/ajax'
import { getApolloServerClient } from '../../../services/apollo.server'
import { wenquRequest, WenquSearchResponse } from '../../../services/wenqu'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/auth-v4')
}

export const revalidate = 60 * 60 * 24 * 3 // 3 day

async function Page() {
  const client = getApolloServerClient()
  const data = await client.query<PublicDataQuery>({
    query: PublicDataDocument,
    variables: {
      limit: 50
    },
    fetchPolicy: 'network-only'
  })

  const dbIds = data.
    data.
    public.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  const rq = getReactQueryClient()
  await rq.prefetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
      <AuthV4Content
        publicData={data.data}
      />
    </HydrationBoundary>
  )
}

export default Page
