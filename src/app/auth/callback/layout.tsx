import GalleryBackgroundView from '@/components/galleryBackgroundView'
import { duration3Days } from '@/hooks/book'
import { PublicDataDocument, type PublicDataQuery } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { type WenquSearchResponse, wenquRequest } from '@/services/wenqu'

type AuthCallbackLayoutProps = {
  children: React.ReactNode
}

async function AuthCallbackLayout(props: AuthCallbackLayoutProps) {
  const { children } = props
  const client = getApolloServerClient()
  const data = await client.query<PublicDataQuery>({
    query: PublicDataDocument,
    variables: {
      limit: 50,
    },
    fetchPolicy: 'network-only',
  })

  const dbIds =
    data.data.public.books.map((x) => x.doubanId).filter((x) => x.length > 3) ??
    []

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
  return (
    <div className='relative min-h-screen overflow-hidden'>
      <GalleryBackgroundView publicData={data.data} />
      <div className='absolute inset-0'>
        <div
          className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 dark:from-blue-400/20 dark:to-indigo-400/20'
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          }}
        />
        <div className='absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-zinc-900/40' />
      </div>
      <div className='absolute top-0 left-0 min-h-screen flex items-center justify-center p-4 with-fade-in w-full'>
        <div className='container'>{children}</div>
      </div>
    </div>
  )
}

export default AuthCallbackLayout
