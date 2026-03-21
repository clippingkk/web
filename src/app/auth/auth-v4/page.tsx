import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import type React from 'react'

import GalleryBackgroundView from '@/components/galleryBackgroundView'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'
import { duration3Days } from '@/hooks/book'
import { PublicDataDocument, type PublicDataQuery } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { type WenquSearchResponse, wenquRequest } from '@/services/wenqu'

import ForceClean from './clean'
import AuthV4Content from './content'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/auth-v4')
}

async function Page() {
  const client = getApolloServerClient()
  const data = await client.query<PublicDataQuery>({
    query: PublicDataDocument,
    variables: {
      limit: 50,
    },
    fetchPolicy: 'network-only',
  })

  const dbIds =
    data.data?.public.books
      .map((x) => x.doubanId)
      .filter((x) => x.length > 3) ?? []

  const rq = getReactQueryClient()
  await rq.prefetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () =>
      wenquRequest<WenquSearchResponse>(
        `/books/search?dbIds=${dbIds.join('&dbIds=')}`
      ),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
      <ForceClean />
      <div className="relative h-full w-full bg-slate-100 dark:bg-slate-900">
        <GalleryBackgroundView publicData={data.data} />
        <div
          className="with-fade-in absolute top-0 right-0 bottom-0 left-0 flex h-full w-full flex-col items-center justify-center"
          style={
            {
              '--start-color': 'oklch(45.08% 0.133 252.21 / 7.28%)',
              '--end-color': 'oklch(45.08% 0.133 252.21 / 77.28%)',
              backgroundImage:
                'radial-gradient(var(--start-color) 0%, var(--end-color) 100%)',
            } as React.CSSProperties
          }
        >
          <div className="flex h-full w-full items-center justify-center bg-slate-200/5 backdrop-blur-xs">
            <AuthV4Content />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default Page
