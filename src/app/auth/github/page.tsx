import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import type React from 'react'

import GalleryBackgroundView from '../../../components/galleryBackgroundView'
import { generateMetadata as authGenerateMetadata } from '../../../components/og/og-with-auth'
import {
  PublicDataDocument,
  type PublicDataQuery,
} from '../../../schema/generated'
import { getReactQueryClient } from '../../../services/ajax'
import { getApolloServerClient } from '../../../services/apollo.server'
import {
  isValidDoubanId,
  wenquBooksByIdsQueryOptions,
} from '../../../services/wenqu'
import GithubOAuthContent from './content'

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
      limit: 50,
    },
    fetchPolicy: 'network-only',
  })

  const dbIds =
    data.data?.public.books.map((x) => x.doubanId).filter(isValidDoubanId) ?? []

  const rq = getReactQueryClient()
  await rq.prefetchQuery(wenquBooksByIdsQueryOptions(dbIds))
  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
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
          <div className="bg-opacity-5 flex h-full w-full items-center justify-center bg-slate-200 backdrop-blur-xs">
            {(await props.searchParams).code && (
              <GithubOAuthContent code={(await props.searchParams).code} />
            )}
            {!(await props.searchParams).code && (
              <div className="text-7xl">No code provided</div>
            )}
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}

export default Page
