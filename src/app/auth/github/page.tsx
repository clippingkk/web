import React from 'react'
import { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'
import GithubOAuthContent from './content'
import { getApolloServerClient } from '../../../services/apollo.server'
import { PublicDataDocument, PublicDataQuery } from '../../../schema/generated'
import { getReactQueryClient } from '../../../services/ajax'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import GalleryBackgroundView from '../../../components/galleryBackgroundView'
import { duration3Days } from '@/hooks/book'
import { wenquRequest, WenquSearchResponse } from '../../../services/wenqu'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/github')
}

type PageProps = {
  searchParams: Promise<{
    code: string
  }>
}

// 明明可以在服务端做完的，但是还是算了，放到客户端慢点儿弄吧
async function Page(props: PageProps) {
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
    (<HydrationBoundary state={d}>
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
          <div className='w-full h-full bg-slate-200 bg-opacity-5 backdrop-blur-sm flex justify-center items-center'>
            {(await props.searchParams).code && (
              <GithubOAuthContent code={(await props.searchParams).code} />
            )}
            {!(await props.searchParams).code && (
              <div className='text-7xl'>No code provided</div>
            )}

          </div>
        </div>
      </div>
    </HydrationBoundary>)
  )
}

export default Page
