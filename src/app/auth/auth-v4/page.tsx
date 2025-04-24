import React from 'react'
import AuthV4Content from './content'
import { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { duration3Days } from '@/hooks/book'
import { PublicDataQuery, PublicDataDocument } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import GalleryBackgroundView from '@/components/galleryBackgroundView'
import ForceClean from './clean'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/auth-v4')
}

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
      <ForceClean />
      <div className='w-full h-full bg-slate-100 dark:bg-slate-900 relative'>
        <GalleryBackgroundView publicData={data.data} />
        <div
          className='absolute top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col justify-center items-center with-fade-in'
          style={{
            '--start-color': 'oklch(45.08% 0.133 252.21 / 7.28%)',
            '--end-color': 'oklch(45.08% 0.133 252.21 / 77.28%)',
            backgroundImage: 'radial-gradient(var(--start-color) 0%, var(--end-color) 100%)',
          } as React.CSSProperties}
        >
          <div className='w-full h-full bg-slate-200 bg-opacity-5 backdrop-blur-xs flex justify-center items-center'>
            <AuthV4Content />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default Page
