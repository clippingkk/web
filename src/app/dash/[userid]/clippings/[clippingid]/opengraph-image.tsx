import { ImageResponse } from 'next/og'
import Logo from '@/assets/bootsplash_logo@3x.png'
import { APP_URL_ORIGIN } from '@/constants/config'
import { FetchClippingQuery, FetchClippingQueryVariables, FetchClippingDocument } from '../../../../../schema/generated'
import { getApolloServerClient } from '../../../../../services/apollo.server'
import { duration3Days } from '../../../../../hooks/book'
import { getReactQueryClient } from '../../../../../services/ajax'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../../../services/wenqu'

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

  console.log(Logo.src)

  const content = clippingsResponse.data.clipping.content

  let contentFontSize = '3rem'
  // TODO: 23 chars every line



  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#3498db',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={logoSrc} width={100} height={100} />
        <div
          style={{
            padding: '2rem',
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >

          <h2 style={{ fontSize: '3rem' }}>{content}</h2>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'flex-end',
            justifyContent: 'space-between'
          }}>
            <h4 style={{ fontSize: '2rem', }}>{b?.title}</h4>
            <h5 style={{ fontSize: '1.5rem', textAlign: 'right' }}>{b?.author}</h5>
          </div>
        </div>

      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await LXGWWenKai,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
