import { ImageResponse } from 'next/og'
import Logo from '@/assets/bootsplash_logo@3x.png'
import { APP_URL_ORIGIN } from '@/constants/config'
import { FetchClippingQuery, FetchClippingQueryVariables, FetchClippingDocument } from '../../../../../schema/generated'
import { getApolloServerClient } from '../../../../../services/apollo.server'
import { duration3Days } from '../../../../../hooks/book'
import { getReactQueryClient } from '../../../../../services/ajax'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../../../services/wenqu'
import Loading from './loading'
import OGImageClipping from '../../../../../components/og/image-clipping'

export const runtime = 'edge'

export const alt = 'About Acme'
export const size = {
  width: 1200,
  height: 630,
}
export const dynamic = 'force-dynamic'
export const contentType = 'image/png'

// Image generation
export default async function Image(req: { params: { userid: string; clippingid: string } }) {
  const uid = ~~req.params.userid
  const cid = ~~req.params.clippingid

  const client = getApolloServerClient()
  const clippingsResponse = await client.query<FetchClippingQuery, FetchClippingQueryVariables>({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid,
    },
  })

  const rq = getReactQueryClient()
  const bookID = clippingsResponse.data.clipping.bookID
  let b: WenquBook | null = null
  if (bookID && bookID.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    b = bs.books.length === 1 ? bs.books[0] : null
  }

  let u = new URL('LXGWWenKai-Regular.ttf', import.meta.url)
  let logoSrc = Logo.src

  if (!u.host) {
    u = new URL(u, APP_URL_ORIGIN)
  }
  if (!logoSrc.startsWith('http')) {
    logoSrc = new URL(logoSrc, APP_URL_ORIGIN).href
  }

  const LXGWWenKai = fetch(u).then((res) => res.arrayBuffer())

  const content = clippingsResponse.data.clipping.content

  if (!b) {
    return new Response(
      JSON.stringify({
        error: 'Book not found',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new ImageResponse(
    (
      <OGImageClipping content={content} b={b} logoSrc={logoSrc} />
    ),
    {
      ...size,
      fonts: [
        {
          name: 'LXGWWenKai',
          data: await LXGWWenKai,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
