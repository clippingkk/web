import GalleryBackgroundView from '@/components/galleryBackgroundView'
import { PublicDataDocument, type PublicDataQuery } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import {
  isValidDoubanId,
  wenquBooksByIdsQueryOptions,
} from '@/services/wenqu'

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
    data.data?.public.books.map((x) => x.doubanId).filter(isValidDoubanId) ?? []

  const rq = getReactQueryClient()
  await rq.prefetchQuery(wenquBooksByIdsQueryOptions(dbIds))
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalleryBackgroundView publicData={data.data} />
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 dark:from-blue-400/20 dark:to-indigo-400/20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm dark:bg-zinc-900/40" />
      </div>
      <div className="with-fade-in absolute top-0 left-0 flex min-h-screen w-full items-center justify-center p-4">
        <div className="container">{children}</div>
      </div>
    </div>
  )
}

export default AuthCallbackLayout
